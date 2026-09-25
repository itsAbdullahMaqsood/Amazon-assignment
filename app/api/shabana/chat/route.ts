import { NextResponse } from "next/server";

import connectDb from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import { escapeRegex } from "@/utils/regex";
import { toCardProduct } from "@/lib/recommendations";
import { lowestPrice } from "@/lib/price";

const persona = `You are Shabana, the shopping assistant inside Markaz, a general store.
You are warm, practical and brief: two or three short sentences, like a friendly shop
assistant who knows the stock. Never invent products, prices, stock or reviews: the
catalogue is searched separately and only real results are shown next to your reply.`;

const systemPrompt = (departments: string[], products: any[]) => `${persona}

This store sells these departments:
${departments.map((name) => `- ${name}`).join("\n")}

${
    products.length
        ? `The shopper is looking at the product(s) below. Answer questions about them ONLY from
this information. When the answer is not in it, say plainly that the listing and reviews
don't say. When you use a review, say it is what a reviewer said, and give counts when
several agree ("two of three reviewers mention ..."). When comparing, be concrete and fair,
and name which one suits which need. Leave "groups" empty unless they ask for alternatives.

${products.map(describeProduct).join("\n\n")}`
        : `When the shopper wants products, propose up to three groups. Each group has a short
display title (e.g. "Trail running shoes") and must set "department" to the one department
above that would stock it, copied exactly. If no department could stock what they asked for,
return an empty groups array and say plainly that Markaz does not carry it.
"keywords" are optional words to narrow within that department, such as a colour, brand or
product type; leave the array empty when the department alone is enough. A budget ("under
$50") goes in "maxPrice" as a number, otherwise 0.`
}

Always offer three short follow-up questions the shopper might tap next, phrased as the
shopper would ask them.`;

// Everything the model may use when a product is in context, straight from the
// product document: no summary written by us, no invented attributes.
const describeProduct = (product: any, index: number) => {
    const { price, listPrice } = lowestPrice(product);
    const reviews = (product.reviews || []).slice(0, 25);

    return [
        `PRODUCT ${index + 1}: ${product.name}`,
        product.brand && `Brand: ${product.brand}`,
        `Price: from $${price.toFixed(2)}${listPrice > price ? ` (list $${listPrice.toFixed(2)})` : ""}`,
        `Rating: ${product.numberReviews ? `${Number(product.rating).toFixed(1)} of 5 from ${product.numberReviews} reviews` : "no reviews yet"}`,
        `Returns: ${product.refundPolicy || "not stated"}`,
        `Options: ${(product.subProducts || []).length} colour(s); sizes ${[...new Set((product.subProducts || []).flatMap((sub: any) => (sub.sizes || []).map((s: any) => s.size)))].join(", ")}`,
        `Description: ${product.description}`,
        ...(product.details || []).map((detail: any) => `${detail.name}: ${detail.value}`),
        reviews.length
            ? `Reviews:\n${reviews.map((review: any) => `- ${review.rating}/5${review.verified ? " (verified purchase)" : ""}: "${String(review.review).slice(0, 400)}"`).join("\n")}`
            : "Reviews: none yet",
    ]
        .filter(Boolean)
        .join("\n");
};

const responseSchema = {
    type: "object",
    properties: {
        reply: { type: "string" },
        groups: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    department: { type: "string" },
                    keywords: { type: "array", items: { type: "string" } },
                    maxPrice: { type: "number" },
                },
                required: ["title", "department", "keywords", "maxPrice"],
            },
        },
        followUps: { type: "array", items: { type: "string" } },
    },
    required: ["reply", "groups", "followUps"],
};

// Gemini's free tier answers 503 (overloaded) or 429 (rate limited) for
// roughly half of calls under load, and a spike often outlasts a couple of
// seconds. Four retries with doubling waits (about 15s worst case), honouring
// Retry-After when Gemini sends one, turn most of those into a slower answer
// instead of "Shabana is busy".
const MAX_RETRIES = 4;

const callGemini = async (body: any, attempt = 0): Promise<any> => {
    const model = process.env.GEMINI_MODEL;
    const key = process.env.GEMINI_API_KEY;

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": key as string },
            body: JSON.stringify(body),
        }
    );

    if ((res.status === 503 || res.status === 429) && attempt < MAX_RETRIES) {
        const hinted = Number(res.headers.get("retry-after")) * 1000;
        const backoff = 1000 * 2 ** attempt + Math.random() * 400;

        await new Promise((resolve) => setTimeout(resolve, Math.min(hinted || backoff, 8000)));
        return callGemini(body, attempt + 1);
    }

    return res;
};

const askGemini = async (messages: any[], departments: string[], products: any[]) => {
    if (!process.env.GEMINI_MODEL || !process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY and GEMINI_MODEL must be set.");
    }

    const res = await callGemini({
        systemInstruction: { parts: [{ text: systemPrompt(departments, products) }] },
        contents: messages.slice(-10).map((message: any) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: String(message.content || "").slice(0, 2000) }],
        })),
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.4,
        },
    });

    if (res.status === 503 || res.status === 429) {
        throw new Error("Shabana is busy right now. Please try again in a moment.");
    }

    if (!res.ok) {
        const detail = await res.text();
        throw new Error(`Gemini returned ${res.status}: ${detail.slice(0, 200)}`);
    }

    const data = await res.json();

    return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
};

const stopWords = new Set(["for", "the", "and", "with", "under", "over", "best", "top", "your"]);

const tokens = (value: string) =>
    String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((token) => token.length > 2 && !stopWords.has(token))
        .map((token) => (token.endsWith("s") ? token.slice(0, -1) : token));

// The model will happily file "snowboard bindings" under Toys & Sports. Showing
// that department's bestsellers would answer a question nobody asked, so the
// group's own title has to share a word with the department it was assigned.
const titleFitsDepartment = (title: string, department: string) => {
    const departmentTokens = new Set(tokens(department));
    return tokens(title).some((token) => departmentTokens.has(token));
};

// Retrieval is grounded in the real taxonomy: the model picks a department that
// exists, and the catalogue is queried inside it. Only real rows are returned.
const findProducts = async (group: any, exclude: string[], taxonomy: any[]) => {
    const department = taxonomy.find(
        (entry) => entry.name.toLowerCase() === String(group.department || "").toLowerCase()
    );

    const terms = (group.keywords || [])
        .map((keyword: string) => String(keyword).trim())
        .filter((keyword: string) => keyword.length > 2)
        .slice(0, 3);

    const nameClause = (term: string) => {
        const pattern = { $regex: escapeRegex(term), $options: "i" };
        return { $or: [{ name: pattern }, { brand: pattern }] };
    };

    const scope: any = department
        ? department.kind === "category"
            ? { category: department._id }
            : { subCategories: department._id }
        : null;

    // Without a real department there is nothing to search inside, so the store
    // simply does not stock it.
    if (!scope) {
        return { products: [], href: "" };
    }

    // A budget is applied to the price the shopper would actually pay, after
    // the variant's discount, so the filter runs on the shaped rows.
    const maxPrice = Number(group.maxPrice) > 0 ? Number(group.maxPrice) : Infinity;

    const search = async (clause: any) => {
        const rows: any[] = await Product.find({ ...clause, _id: { $nin: exclude } })
            .sort({ rating: -1, "subProducts.sold": -1 })
            .limit(40)
            .lean();

        return rows.filter((row) => lowestPrice(row).price <= maxPrice).slice(0, 3);
    };

    const params = new URLSearchParams({ category: department.categorySlug });
    if (department.kind === "sub") params.set("sub", department.slug);
    if (Number.isFinite(maxPrice)) params.set("price", `_${maxPrice}`);

    if (terms.length) {
        const narrowed: any[] = await search({
            ...scope,
            $and: terms.map((term: string) => nameClause(term)),
        });

        if (narrowed.length) {
            return { products: narrowed.map(toCardProduct), href: `/browse?${params.toString()}` };
        }
    }

    // Keywords found nothing inside the department: only fall back to the
    // department's own best sellers when the group is plausibly about it.
    if (!titleFitsDepartment(group.title, department.name)) {
        return { products: [], href: "" };
    }

    const products: any[] = await search(scope);

    return { products: products.map(toCardProduct), href: `/browse?${params.toString()}` };
};

export const POST = async (req: Request) => {
    try {
        const { messages, productIds } = await req.json();

        if (!Array.isArray(messages) || !messages.length) {
            return NextResponse.json({ message: "No messages provided." }, { status: 400 });
        }

        await connectDb();

        const ids = (Array.isArray(productIds) ? productIds : [])
            .map(String)
            .filter((id: string) => /^[0-9a-f]{24}$/i.test(id))
            .slice(0, 3);

        const [categories, subCategories, contextProducts] = await Promise.all([
            Category.find().select("name slug").lean(),
            SubCategory.find().select("name slug parent").lean(),
            ids.length
                ? Product.find({ _id: { $in: ids } })
                      .select("name brand description details reviews rating numberReviews refundPolicy subProducts")
                      .lean()
                : Promise.resolve([]),
        ]);

        const slugOf = new Map((categories as any[]).map((entry) => [String(entry._id), entry.slug]));
        const taxonomy = [
            ...categories.map((entry: any) => ({ ...entry, kind: "category", categorySlug: entry.slug })),
            ...subCategories.map((entry: any) => ({ ...entry, kind: "sub", categorySlug: slugOf.get(String(entry.parent)) || "" })),
        ];

        const answer = await askGemini(
            messages,
            categories.map((entry: any) => entry.name).concat(subCategories.map((entry: any) => entry.name)),
            contextProducts as any[]
        );

        const groups = [];
        const shown: string[] = ids.slice();

        for (const group of answer.groups || []) {
            const { products, href } = await findProducts(group, shown, taxonomy);

            if (products.length) {
                products.forEach((product: any) => shown.push(product._id));
                groups.push({ title: group.title, href, products });
            }
        }

        const askedForProducts = (answer.groups || []).length > 0;
        const unavailable = groups.length === 0 && askedForProducts && !ids.length;

        // The model sometimes asserts that we stock something. Nothing was found,
        // so the reply is replaced rather than left contradicting the catalogue.
        const reply = unavailable
            ? "Markaz doesn't carry that yet, so I can't show you real options for it. Want me to look for something close?"
            : answer.reply || "";

        return NextResponse.json({
            reply,
            groups: JSON.parse(JSON.stringify(groups)),
            followUps: (answer.followUps || []).slice(0, 3),
            unavailable,
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
