import { NextResponse } from "next/server";

import connectDb from "@/lib/db";
import Product from "@/models/Product";

const applyDiscount = (price: number, discount: number) =>
    Number((discount > 0 ? price - price / 100 * discount : price).toFixed(2));

// Re-prices a persisted cart against the database. The client's prices are read
// only to identify the line; every money value in the response comes from Mongo.
// It reads nothing private, so a signed-out shopper's cart is re-priced too. A
// line whose product, variant or size has gone is flagged rather than kept at
// its old price.
export const POST = async (req: Request) => {
    try {
        const { products } = await req.json();

        if (!Array.isArray(products)) {
            return NextResponse.json({ message: "Send the cart lines as `products`." }, { status: 400 });
        }

        await connectDb();

        const updated = await Promise.all(
            products.map(async (p: any) => {
                const dbProduct: any = await Product.findById(p._id).lean().catch(() => null);
                const subProduct = dbProduct?.subProducts?.[p.style];
                const sizeRow = subProduct?.sizes?.find((s: any) => s.size === p.size);

                if (!sizeRow) {
                    return { ...p, unavailable: true, quantity: 0 };
                }

                const discount = subProduct.discount || 0;

                return {
                    ...p,
                    priceBefore: sizeRow.price,
                    price: applyDiscount(sizeRow.price, discount),
                    discount,
                    quantity: sizeRow.qty,
                    shipping: dbProduct.shipping,
                    slug: dbProduct.slug,
                    unavailable: false,
                    // What the shopper saw when they added it, so the cart can say
                    // when the price has moved since.
                    previousPrice: p.addedPrice ?? p.price,
                };
            })
        );

        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
