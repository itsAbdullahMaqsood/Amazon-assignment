import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Product from "@/models/Product";

const applyDiscount = (price: number, discount: number) =>
    Number((discount > 0 ? price - price / 100 * discount : price).toFixed(2));

// Re-prices a persisted cart against the database. The client's prices are read
// only to identify the line; every money value in the response comes from Mongo.
export const POST = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { products } = await req.json();

        await connectDb();

        const updated = await Promise.all(
            products.map(async (p: any) => {
                const dbProduct: any = await Product.findById(p._id).lean();

                if (!dbProduct) {
                    return p;
                }

                const subProduct = dbProduct.subProducts[p.style];

                if (!subProduct) {
                    return p;
                }

                const sizeRow = subProduct.sizes.find((s: any) => s.size === p.size);

                if (!sizeRow) {
                    return p;
                }

                const discount = subProduct.discount || 0;

                return {
                    ...p,
                    priceBefore: sizeRow.price,
                    price: applyDiscount(sizeRow.price, discount),
                    discount,
                    quantity: sizeRow.qty,
                    shippingFee: dbProduct.shipping,
                };
            })
        );

        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
