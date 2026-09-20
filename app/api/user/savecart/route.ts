import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Product from "@/models/Product";
import Cart from "@/models/Cart";
import User from "@/models/User";

const applyDiscount = (price: number, discount: number) =>
    Number((discount > 0 ? price - price / 100 * discount : price).toFixed(2));

// The checkout page reads the Cart document, so every line is rebuilt from the
// database here; nothing the client sent about price or name is persisted.
export const POST = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { cart } = await req.json();

        await connectDb();

        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        await Cart.deleteOne({ user: user._id });

        const products = [];
        let cartTotal = 0;

        for (const item of cart) {
            const dbProduct: any = await Product.findById(item._id).lean();

            if (!dbProduct) {
                continue;
            }

            const subProduct = dbProduct.subProducts[item.style];

            if (!subProduct) {
                continue;
            }

            const sizeRow = subProduct.sizes.find((s: any) => s.size === item.size);

            if (!sizeRow) {
                continue;
            }

            const price = applyDiscount(sizeRow.price, subProduct.discount || 0);
            const qty = Number(item.qty);

            products.push({
                product: dbProduct._id,
                name: dbProduct.name,
                image: subProduct.images[0].url,
                size: item.size,
                qty,
                color: {
                    color: subProduct.color?.color,
                    image: subProduct.color?.image,
                },
                price,
            });

            cartTotal += price * qty;
        }

        await new Cart({
            products,
            cartTotal: Number(cartTotal.toFixed(2)),
            user: user._id,
        }).save();

        return NextResponse.json({ message: "cart Items succesfully added.", status: true });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
