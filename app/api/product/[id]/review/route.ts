import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User";

const MAX_REVIEW = 1000;

// Reloaded the way the product page loads them, trimmed to the two fields a
// review card renders: the rest of a User document has no business on the client.
const loadReviews = async (productId: string) => {
    const product: any = await Product.findById(productId)
        .select("reviews")
        .populate({ path: "reviews.reviewBy", model: User, select: "name image" })
        .lean();

    return JSON.parse(JSON.stringify(product?.reviews || []));
};

// The average is always recomputed from what is stored, so no request can talk a
// product into a rating it has not been given.
const recount = (product: any) => {
    const reviews = product.reviews || [];
    const total = reviews.reduce((sum: number, entry: any) => sum + Number(entry.rating || 0), 0);

    product.rating = reviews.length ? Number((total / reviews.length).toFixed(1)) : 0;
    product.numberReviews = reviews.length;
};

export const POST = async (req: Request, { params }: any) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { id } = await params;
        const { rating, review, size, style, fit } = await req.json();

        const score = Number(rating);

        if (!Number.isFinite(score) || score < 1 || score > 5) {
            return NextResponse.json(
                { message: "Please choose a rating between 1 and 5 stars." },
                { status: 400 }
            );
        }

        const text = String(review ?? "").trim();

        if (!text || text.length > MAX_REVIEW) {
            return NextResponse.json(
                { message: `Your review has to be between 1 and ${MAX_REVIEW} characters.` },
                { status: 400 }
            );
        }

        await connectDb();

        const product: any = await Product.findById(id);

        if (!product) {
            return NextResponse.json({ message: "Product not found." }, { status: 404 });
        }

        // The badge keys off a paid order of THIS product placed by the signed-in
        // user — checked here rather than trusted from the form.
        const verified = Boolean(
            await Order.exists({
                user: session.user.id,
                isPaid: true,
                "products.product": id,
            })
        );

        const existing = product.reviews.find(
            (entry: any) => String(entry.reviewBy) === String(session.user.id)
        );

        // One review per person per product: a second submission is an edit, which
        // is also why the average is recomputed instead of nudged.
        if (existing) {
            existing.rating = score;
            existing.review = text;
            existing.size = size || existing.size;
            existing.style = style || existing.style;
            existing.fit = fit || "";
            existing.verified = verified;
        } else {
            product.reviews.push({
                reviewBy: session.user.id,
                rating: score,
                review: text,
                size: size || "",
                style: style || {},
                fit: fit || "",
                verified,
                likes: [],
            });
        }

        recount(product);
        await product.save();

        return NextResponse.json({
            reviews: await loadReviews(id),
            rating: product.rating,
            numberReviews: product.numberReviews,
            message: existing
                ? "Your review has been updated."
                : "Thanks — your review is now on this product.",
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

// Helpful votes. The signed-in user's id goes in and out of the review's `likes`,
// so the count is a count of people rather than of clicks.
export const PATCH = async (req: Request, { params }: any) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
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
