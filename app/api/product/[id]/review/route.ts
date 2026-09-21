import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User";
import { CLOUDINARY_ROOT, destroyAsset } from "@/lib/cloudinary";

const FITS = ["Small", "True to size", "Large"];
const MAX_REVIEW = 1000;
const MAX_IMAGES = 3;

const bad = (message: string) => NextResponse.json({ message }, { status: 400 });

// Newest first, reviewer trimmed to what a card shows: the rest of a User
// document has no business on the client.
const loadReviews = async (productId: string) => {
    const product: any = await Product.findById(productId)
        .select("reviews rating numberReviews")
        .populate({ path: "reviews.reviewBy", model: User, select: "name image" })
        .lean();

    const reviews = [...(product?.reviews || [])].sort(
        (a: any, b: any) => Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0)
    );

    return {
        reviews: JSON.parse(JSON.stringify(reviews)),
        rating: product?.rating || 0,
        numberReviews: product?.numberReviews || 0,
    };
};

// The average is always recomputed from what is stored, so no request can talk a
// product into a rating it has not been given.
const recount = (product: any) => {
    const reviews = product.reviews || [];
    const total = reviews.reduce((sum: number, entry: any) => sum + Number(entry.rating || 0), 0);

    product.rating = reviews.length ? Number((total / reviews.length).toFixed(1)) : 0;
    product.numberReviews = reviews.length;
};

// Review photos must be ones this app uploaded into this product's review
// folder; anything else (an arbitrary URL, another product's folder) is refused.
const validImages = (images: any, productId: string) => {
    if (!Array.isArray(images) || images.length > MAX_IMAGES) {
        return null;
    }

    const cloud = String(process.env.CLOUDINARY_NAME || "").trim();
    const folder = `${CLOUDINARY_ROOT}/reviews/${productId}/`;

    for (const image of images) {
        const url = String(image?.url || "");
        const publicId = String(image?.public_url || "");

        if (!url.startsWith(`https://res.cloudinary.com/${cloud}/image/upload/`) || !publicId.startsWith(folder)) {
            return null;
        }
    }

    return images.map((image: any) => ({ url: String(image.url), public_url: String(image.public_url) }));
};

export const GET = async (_req: Request, { params }: any) => {
    const { id } = await params;

    await connectDb();

    return NextResponse.json(await loadReviews(id));
};

export const PUT = async (req: Request, { params }: any) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Please sign in to write a review." }, { status: 401 });
        }

        const { id } = await params;
        const { rating, review, size, style, fit, images } = await req.json();

        // Half-star steps between 0.5 and 5, nothing in between.
        const score = Number(rating);

        if (!Number.isFinite(score) || score < 0.5 || score > 5 || !Number.isInteger(score * 2)) {
            return bad("Please select a rating between half a star and 5 stars.");
        }

        const text = String(review ?? "").trim();

        if (!text) {
            return bad("Please add a review!");
        }

        if (text.length > MAX_REVIEW) {
            return bad(`Reviews are limited to ${MAX_REVIEW} characters.`);
        }

        if (!FITS.includes(fit)) {
            return bad("Please select a Fit!");
        }

        await connectDb();

        const product: any = await Product.findById(id);

        if (!product) {
            return NextResponse.json({ message: "Product not found." }, { status: 404 });
        }

        // Size and style must be ones this product actually comes in.
        const sizes = new Set<string>(
            product.subProducts.flatMap((sub: any) => sub.sizes.map((row: any) => String(row.size)))
        );

        if (!sizes.has(String(size))) {
            return bad("Please select a size!");
        }

        const colour = product.subProducts
            .map((sub: any) => sub.color)
            .find((c: any) => c && String(c.color) === String(style?.color));

        if (!colour) {
            return bad("Please select a style!");
        }

        const photos = validImages(images || [], String(product._id));

        if (!photos) {
            return bad(`Add up to ${MAX_IMAGES} photos uploaded for this product.`);
        }

        // Earned, never claimed: a paid order of THIS product by THIS user.
        const verified = Boolean(
            await Order.exists({
                user: session.user.id,
                isPaid: true,
                "products.product": product._id,
            })
        );

        const existing = product.reviews.find(
            (entry: any) => String(entry.reviewBy) === String(session.user.id)
        );

        const entry = {
            rating: score,
            review: text,
            size: String(size),
            style: { color: colour.color, image: colour.image || "" },
            fit,
            images: photos,
            verified,
        };

        let dropped: string[] = [];

        // One review per person per product: a second submission edits the first.
        if (existing) {
            const kept = new Set(photos.map((photo: any) => photo.public_url));
            dropped = (existing.images || [])
                .map((photo: any) => photo?.public_url)
                .filter((publicId: any) => publicId && !kept.has(publicId));

            Object.assign(existing, entry);
        } else {
            product.reviews.push({ ...entry, reviewBy: session.user.id, likes: [] });
        }

        recount(product);
        await product.save();

        // Photos taken off an edited review are not left orphaned in Cloudinary.
        await Promise.allSettled(dropped.map((publicId) => destroyAsset(publicId)));

        return NextResponse.json({
            ...(await loadReviews(id)),
            message: existing ? "Your review has been updated." : "Thanks — your review is live.",
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
