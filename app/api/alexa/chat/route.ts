import { NextResponse } from "next/server";

import connectDb from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import { escapeRegex } from "@/utils/regex";
import { toCardProduct } from "@/lib/recommendations";

const systemPrompt = (departments: string[]) => `You are Alexa, a shopping assistant inside an Amazon-style store.
Answer in two or three short sentences, the way a helpful shop assistant would.

This store only sells the following departments:
${departments.map((name) => `- ${name}`).join("\n")}

When the shopper wants products, propose up to three groups. Each group has a
short display title (e.g. "Baseball Caps") and must set "department" to the one
department above that would stock it, copied exactly. If no department above
could stock what they asked for, return an empty groups array and say plainly
that the store does not carry it.
"keywords" are optional extra words to narrow within that department, such as a
colour or a brand; leave the array empty when the department alone is enough.
Always offer three or four short follow-up questions the shopper might tap next.
Never invent specific products, prices or availability: the catalogue is searched
separately and only real results are shown.`;

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
                },
                required: ["title", "department", "keywords"],
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
// instead of "Alexa is busy".
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

const askGemini = async (messages: any[], departments: string[]) => {
    if (!process.env.GEMINI_MODEL || !process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY and GEMINI_MODEL must be set.");
    }

    const res = await callGemini({
        systemInstruction: { parts: [{ text: systemPrompt(departments) }] },
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
        throw new Error("Alexa is busy right now. Please try again in a moment.");
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
        return [];
    }

    const search = (clause: any) =>
        Product.find({ ...clause, _id: { $nin: exclude } })
            .sort({ rating: -1, "subProducts.sold": -1 })
            .limit(3)
            .lean();

    if (terms.length) {
        const narrowed: any[] = await search({
            ...scope,
            $and: terms.map((term: string) => nameClause(term)),
        });

        if (narrowed.length) {
            return narrowed.map(toCardProduct);
        }
    }

    // Keywords found nothing inside the department: only fall back to the
    // department's own bestsellers when the group is plausibly about it.
    if (!titleFitsDepartment(group.title, department.name)) {
        return [];
    }

    const products: any[] = await search(scope);

    return products.map(toCardProduct);
};

export const POST = async (req: Request) => {
    try {
        const { messages } = await req.json();

        if (!Array.isArray(messages) || !messages.length) {
            return NextResponse.json({ message: "No messages provided." }, { status: 400 });
        }

        await connectDb();

        const [categories, subCategories] = await Promise.all([
            Category.find().select("name").lean(),
            SubCategory.find().select("name").lean(),
        ]);

        const taxonomy = [
            ...categories.map((entry: any) => ({ ...entry, kind: "category" })),
            ...subCategories.map((entry: any) => ({ ...entry, kind: "sub" })),
        ];

        const answer = await askGemini(
            messages,
            taxonomy.map((entry: any) => entry.name)
        );

        const groups = [];
        const shown: string[] = [];

        for (const group of answer.groups || []) {
            const products = await findProducts(group, shown, taxonomy);

            if (products.length) {
                products.forEach((product: any) => shown.push(product._id));
                groups.push({ title: group.title, products });
            }
        }

        const askedForProducts = (answer.groups || []).length > 0;
        const unavailable = groups.length === 0 && askedForProducts;

        // The model sometimes asserts that we stock something. Nothing was found,
        // so the reply is replaced rather than left contradicting the catalogue.
        const reply = unavailable
            ? "We don't carry that in our catalogue yet, so I can't show you any options for it."
            : answer.reply || "";

        return NextResponse.json({
            reply,
            groups: JSON.parse(JSON.stringify(groups)),
            followUps: (answer.followUps || []).slice(0, 4),
            unavailable,
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
