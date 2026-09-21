import { NextResponse } from "next/server";

import connectDb from "@/lib/db";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/guard";
import { destroyAsset } from "@/lib/cloudinary";
import { colorImageId, ownedPublicIds, parseProductBody } from "@/lib/productAdmin";

const find = (id: string) => Product.findById(id).catch(() => null);

// The shared fields of a product, for "add a colour variant" mode, which locks
// and prefills them from the parent.
export const GET = async (_req: Request, { params }: any) => {
    const { error } = await requireAdmin();

    if (error) {
        return error;
    }

    const { id } = await params;

    await connectDb();

    const product: any = await Product.findById(id)
        .select("name description brand category subCategories shipping details questions slug subProducts.color")
        .lean()
        .catch(() => null);

    if (!product) {
        return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({
        _id: String(product._id),
        name: product.name,
        slug: product.slug,
        description: product.description,
        brand: product.brand || "",
        category: String(product.category),
        subCategories: (product.subCategories || []).map(String),
        shipping: product.shipping ?? 0,
        details: product.details || [],
        questions: product.questions || [],
        colors: (product.subProducts || []).map((sub: any) => sub.color?.color).filter(Boolean),
    });
};

// Saves the shared fields and ONE variant (`style`). The slug is left alone on
// purpose: renaming a product should not break every link already pointing at it.
export const PUT = async (req: Request, { params }: any) => {
    try {
        const { error } = await requireAdmin();

        if (error) {
            return error;
        }

        const { id } = await params;
        const body = await req.json();

        await connectDb();

        const product: any = await find(id);

        if (!product) {
            return NextResponse.json({ message: "Product not found." }, { status: 404 });
        }

        const style = Number(body.style) || 0;
        const current = product.subProducts[style];

        if (!current) {
            return NextResponse.json({ message: "That variant does not exist." }, { status: 400 });
        }

        const parsed: any = await parseProductBody(body, { variantMode: false, existing: current });

        if (parsed.errors) {
            return NextResponse.json({ message: parsed.errors[0], messages: parsed.errors }, { status: 400 });
        }

        const before = new Set([
            ...[...(current.images || []), ...(current.description_images || [])].map((image: any) => image?.public_url),
            colorImageId(current.color?.image),
        ]);
        const after = new Set([
            ...[...parsed.variant.images, ...parsed.variant.description_images].map((image: any) => image.public_url),
            colorImageId(parsed.variant.color.image),
        ]);

        Object.assign(product, parsed.shared);
        // Stock sold so far belongs to the variant, not to the form.
        Object.assign(current, { ...parsed.variant, sold: current.sold || 0 });
        await product.save();

        // Images taken off the variant are removed from Cloudinary too.
        const dropped = [...before].filter((publicId) => publicId && !after.has(publicId));
        await Promise.allSettled(dropped.map((publicId: any) => destroyAsset(publicId)));

        return NextResponse.json({
            message: `Saved "${product.name}".`,
            product: { _id: product._id, slug: product.slug, style },
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

// Deletes the product and every Cloudinary image it owns (variant images,
// description images, swatches, review photos). Orders keep their own copy of
// name, image and price, so order history is unaffected.
export const DELETE = async (_req: Request, { params }: any) => {
    try {
        const { error } = await requireAdmin();

        if (error) {
            return error;
        }

        const { id } = await params;

        await connectDb();

        const product: any = await find(id);

        if (!product) {
            return NextResponse.json({ message: "Product not found." }, { status: 404 });
        }

        const ids = ownedPublicIds(product);
        const results = await Promise.allSettled(ids.map((publicId: string) => destroyAsset(publicId)));

        await Product.deleteOne({ _id: product._id });

        return NextResponse.json({
            message: `Deleted "${product.name}".`,
            imagesRemoved: results.filter((result) => result.status === "fulfilled").length,
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
