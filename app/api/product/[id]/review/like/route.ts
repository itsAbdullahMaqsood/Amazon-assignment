import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Product from "@/models/Product";

// Helpful votes. The voter's id goes in or out of the review's `likes`, so the
// count is a count of people, not of clicks.
export const PUT = async (req: Request, { params }: any) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Please sign in to vote." }, { status: 401 });
        }

        const { id } = await params;
        const { review_id } = await req.json();

        await connectDb();

        const product: any = await Product.findById(id);

        if (!product) {
            return NextResponse.json({ message: "Product not found." }, { status: 404 });
        }

        const review = product.reviews.id(review_id);

        if (!review) {
            return NextResponse.json({ message: "Review not found." }, { status: 404 });
        }

        const userId = String(session.user.id);

        // Amazon does not let you vote on your own review.
        if (String(review.reviewBy) === userId) {
            return NextResponse.json(
                { message: "You can't vote on your own review." },
                { status: 400 }
            );
        }

        const liked = review.likes.some((like: any) => String(like) === userId);

        review.likes = liked
            ? review.likes.filter((like: any) => String(like) !== userId)
            : [...review.likes, userId];

        await product.save();

        return NextResponse.json({ likes: review.likes.length, liked: !liked });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
