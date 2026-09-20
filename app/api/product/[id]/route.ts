import { NextResponse } from "next/server";

import connectDb from "@/lib/db";
import Product from "@/models/Product";

export const GET = async (req: Request, { params }: any) => {
    try {
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const style = Number(searchParams.get("style")) || 0;
        const size = Number(searchParams.get("size")) || 0;

        await connectDb();

        const product: any = await Product.findById(id).lean();
        const subProduct = product.subProducts[style];
        const discount = subProduct.discount || 0;
        // Rounded once here: cart lines are built straight from this response.
        const round2 = (value: number) => Number(value.toFixed(2));
        const priceBefore = round2(subProduct.sizes[size].price);
        const price = round2(discount ? priceBefore - priceBefore / 100 * discount : priceBefore);

        return NextResponse.json({
            _id: product._id,
            style: Number(style),
            name: product.name,
            description: product.description,
            slug: product.slug,
            sku: subProduct.sku,
            brand: product.brand,
            shipping: product.shipping,
            images: subProduct.images,
            color: subProduct.color,
            size: subProduct.sizes[size].size,
            price,
            priceBefore,
            quantity: subProduct.sizes[size].qty,
            category: product.category,
            subCategories: product.subCategories,
            questions: product.questions,
            details: product.details,
            discount,
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
