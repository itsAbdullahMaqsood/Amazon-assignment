import { NextResponse } from "next/server";

import connectDb from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { escapeRegex } from "@/utils/regex";

// Autocomplete is backed by the catalog itself — no canned suggestion list.
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

        const products: any[] = await Product.find({
            name: { $regex: escapeRegex(q), $options: "i" },
            ...(category && { category }),
        })
            .select("name slug")
            .limit(10)
            .lean();

        return NextResponse.json({
            suggestions: products.map((product) => ({
                name: product.name,
                slug: product.slug,
            })),
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message, suggestions: [] }, { status: 500 });
    }
};
