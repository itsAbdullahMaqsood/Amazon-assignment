import { NextResponse } from "next/server";

import connectDb from "@/lib/db";
import Category from "@/models/Category";

// The search bar's department picker lists the categories that actually exist.
export const GET = async () => {
    try {
        await connectDb();

        const categories: any[] = await Category.find().select("name slug").sort({ name: 1 }).lean();

        return NextResponse.json({
            departments: categories.map((category) => ({
                id: String(category._id),
                name: category.name,
                slug: category.slug,
            })),
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message, departments: [] }, { status: 500 });
    }
};
