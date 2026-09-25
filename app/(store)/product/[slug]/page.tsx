import { cache } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import User from "@/models/User";
import ProductPage from "@/components/ProductPage/ProductPage";
import { recordProductView, toCardProduct } from "@/lib/recommendations";
import { resolveSizeIndex } from "@/utils/sizes";
import { HISTORY_COOKIE } from "@/lib/preferences";
import { applyDiscount } from "@/lib/price";
import { colorName } from "@/lib/colors";
import { departmentHref } from "@/components/Header/navigation";

// Business days from today, skipping weekends. An estimate, and labelled as one
// on the page: nothing in this store actually ships.
const addBusinessDays = (days: number) => {
    const date = new Date();
    let added = 0;

    while (added < days) {
        date.setDate(date.getDate() + 1);
        if (date.getDay() !== 0 && date.getDay() !== 6) added++;
    }

    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

// Cached so generateMetadata and the page share one query. Resolving (and 404ing)
// in generateMetadata happens before the shell streams, so a missing product gets
// a real 404 status.
// How long a product takes to leave the warehouse, read from its own
// "Dispatch" detail ("Ships in 2 weeks", "Ships overnight" ...), in business days.
const dispatchDays = (details: any[] = []) => {
    const text = String(details.find((d) => /dispatch/i.test(d.name))?.value || "").toLowerCase();

    if (!text) return 1;
    if (/overnight/.test(text)) return 1;
    if (/month/.test(text)) return 22;

    const weeks = text.match(/(\d+)\s*week/);
    if (weeks) return Number(weeks[1]) * 5;

    const days = text.match(/(\d+)(?:\s*-\s*(\d+))?\s*(?:business\s*)?day/);
    if (days) return Number(days[2] || days[1]);

    return 2;
};

const getProduct = cache(async (slug: string, style: number, sizeParam: any) => {
    await connectDb();

    const product: any = await Product.findOne({ slug })
        .populate({ path: "category", model: Category, select: "name slug" })
        .populate({ path: "subCategories", model: SubCategory, select: "name slug" })
        // Only what a review card shows: a reviewer's account does not travel with the page.
        .populate({ path: "reviews.reviewBy", model: User, select: "name image" })
        .lean();

    const subProduct = product?.subProducts?.[style];

    if (!subProduct) {
        return null;
    }

    const size = Math.min(resolveSizeIndex(subProduct.sizes, sizeParam), subProduct.sizes.length - 1);
    const row = subProduct.sizes[size];

    if (!row) {
        return null;
    }

    const discount = subProduct.discount || 0;

    return {
        ...product,
        style,
        size,
        images: subProduct.images,
        sizes: subProduct.sizes.map((entry: any) => ({ size: entry.size, qty: entry.qty, price: applyDiscount(entry.price, discount) })),
        discount,
        sku: subProduct.sku,
        variants: product.subProducts.map((sub: any) => ({
            color: sub.color?.color || "",
            image: sub.color?.image || "",
            name: sub.color?.color ? colorName(sub.color.color) : "",
            thumbnail: sub.images?.[0]?.url || "",
            inStock: (sub.sizes || []).some((entry: any) => entry.qty > 0),
        })),
        price: applyDiscount(row.price, discount),
        priceBefore: row.price,
        quantity: row.qty,
        sold: product.subProducts.reduce((sum: number, sub: any) => sum + (sub.sold || 0), 0),
    };
});

const getSimilarProducts = async (product: any) => {
    const sub = product.subCategories?.[0]?._id;
    const bySub: any[] = sub
        ? await Product.find({ subCategories: sub, _id: { $ne: product._id } }).sort({ rating: -1 }).limit(10).lean()
        : [];
    const rest: any[] =
        bySub.length < 5
            ? await Product.find({ category: product.category?._id, _id: { $nin: [product._id, ...bySub.map((p) => p._id)] } })
                  .sort({ rating: -1 })
                  .limit(10 - bySub.length)
                  .lean()
            : [];

    return [...bySub, ...rest].map(toCardProduct);
};

export const generateMetadata = async ({ params, searchParams }: any) => {
    const { slug } = await params;
    const query = await searchParams;
    const product = await getProduct(slug, Number(query?.style) || 0, query?.size);

    if (!product) {
        notFound();
    }

    return {
        title: product.name,
        description: String(product.description || "").slice(0, 160),
        openGraph: { images: product.images?.[0]?.url ? [product.images[0].url] : [] },
    };
};

const Page = async ({ params, searchParams }: any) => {
    const { slug } = await params;
    const query = await searchParams;
    const style = Number(query?.style) || 0;

    const product = await getProduct(slug, style, query?.size);

    if (!product) {
        notFound();
    }

    const session = await auth();
    let saved = false;

    if (session) {
        // Browsing history feeds the account page and the home page, unless the
        // shopper turned it off in their preferences.
        const historyOff = (await cookies()).get(HISTORY_COOKIE)?.value === "0";

        const [user]: any = await Promise.all([
            User.findById(session.user.id).select("whishlist").lean(),
            historyOff ? Promise.resolve() : recordProductView(session.user.id, String(product._id), style),
        ]);

        saved = (user?.whishlist || []).some(
            (entry: any) => String(entry.product) === String(product._id) && String(entry.style) === String(style)
        );
    }

    const similar = await getSimilarProducts(product);
    const category = product.category ? { ...product.category, href: departmentHref(product.category.slug) } : null;

    return (
        <ProductPage
            product={JSON.parse(JSON.stringify({ ...product, category }))}
            similar={JSON.parse(JSON.stringify(similar))}
            saved={saved}
            delivery={{
                from: addBusinessDays(dispatchDays(product.details) + 2),
                to: addBusinessDays(dispatchDays(product.details) + 4),
            }}
        />
    );
};

export default Page;
