import { NextResponse } from "next/server";

import connectDb from "@/lib/db";
import Product from "@/models/Product";
import { escapeRegex } from "@/utils/regex";

// Autocomplete is backed by the catalog itself — no canned suggestion list.
export const GET = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url);
        const q = String(searchParams.get("q") || "").trim();

        if (q.length < 2) {
            return NextResponse.json({ suggestions: [] });
        }

        await connectDb();

        const products: any[] = await Product.find({
            name: { $regex: escapeRegex(q), $options: "i" },
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
