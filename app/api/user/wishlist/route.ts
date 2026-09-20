import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";

// The schema field is `whishlist` — misspelled on purpose and read elsewhere.
const loadList = async (userId: string) => {
    const user: any = await User.findById(userId)
        .select("whishlist")
        .populate({
            path: "whishlist.product",
            model: Product,
            select: "name slug subProducts rating numberReviews",
        })
        .lean();

    return (user?.whishlist || []).filter((entry: any) => entry.product);
};

export const GET = async () => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        await connectDb();

        return NextResponse.json({ whishlist: JSON.parse(JSON.stringify(await loadList(session.user.id))) });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

export const PUT = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { product_id, style } = await req.json();

        await connectDb();

        const product = await Product.findById(product_id).select("_id").lean();

        if (!product) {
            return NextResponse.json({ message: "Product not found." }, { status: 404 });
        }

        const user: any = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const exists = user.whishlist.find(
            (entry: any) =>
                String(entry.product) === String(product_id) && String(entry.style) === String(style)
        );

        if (exists) {
            return NextResponse.json({ message: "Product already in your wishlist." });
        }

        user.whishlist.push({ product: product_id, style: String(style) });
        await user.save();

        return NextResponse.json({ message: "Product added to wishlist successfully." });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

export const DELETE = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { product_id, style } = await req.json();

        await connectDb();

        const user: any = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        user.whishlist = user.whishlist.filter(
            (entry: any) =>
                !(
                    String(entry.product) === String(product_id) &&
                    String(entry.style) === String(style)
                )
        );

        await user.save();

        return NextResponse.json({
            whishlist: JSON.parse(JSON.stringify(await loadList(session.user.id))),
            message: "Removed from your list.",
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
