import { NextResponse } from "next/server";

import connectDb from "@/lib/db";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Product from "@/models/Product";
import { escapeRegex } from "@/utils/regex";
import { lowestPrice } from "@/lib/price";

// Autocomplete is backed by the catalogue itself, never a canned list. Each
// suggestion carries enough to recognise the product without opening it: a
// thumbnail, its department and what it costs.
export const GET = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url);
        const q = String(searchParams.get("q") || "").trim();
        const department = String(searchParams.get("category") || "").trim();

        if (q.length < 2) {
            return NextResponse.json({ suggestions: [] });
        }

        await connectDb();

        // Scoped to the department picked in the search bar, when there is one.
        const category = department
            ? ((await Category.findOne({ slug: department }).select("_id").lean()) as any)?._id
            : undefined;

        const pattern = escapeRegex(q);
        const scope = category ? { category } : {};

        // "lap" should find the MacBooks too: products whose sub-category name
        // matches count as matches even when their own name does not.
        const subs = await SubCategory.find({ name: { $regex: `\\b${pattern}`, $options: "i" } }).select("_id").lean();

        // Names that start with the query rank above names that merely contain it.
        const [starts, contains] = await Promise.all([
            Product.find({ ...scope, name: { $regex: `^${pattern}`, $options: "i" } })
                .select("name slug subProducts category")
                .populate({ path: "category", model: Category, select: "name slug" })
                .sort({ rating: -1 })
                .limit(6)
                .lean(),
            Product.find({
                ...scope,
                $or: [
                    { name: { $regex: pattern, $options: "i" } },
                    { brand: { $regex: `^${pattern}`, $options: "i" } },
                    ...(subs.length ? [{ subCategories: { $in: subs.map((sub: any) => sub._id) } }] : []),
                ],
            })
                .select("name slug subProducts category")
                .populate({ path: "category", model: Category, select: "name slug" })
                .sort({ rating: -1 })
                .limit(8)
                .lean(),
        ]);

        const seen = new Set<string>();
        const products = [...starts, ...contains].filter((product: any) => {
            const id = String(product._id);
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
        });

        return NextResponse.json({
            suggestions: products.slice(0, 7).map((product: any) => ({
                name: product.name,
                slug: product.slug,
                image: product.subProducts?.[0]?.images?.[0]?.url || "",
                price: lowestPrice(product).price,
                department: product.category?.name || "",
            })),
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message, suggestions: [] }, { status: 500 });
    }
};
