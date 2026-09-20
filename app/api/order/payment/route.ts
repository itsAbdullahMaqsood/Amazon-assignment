import { NextResponse } from "next/server";
import crypto from "crypto";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Cart from "@/models/Cart";
import User from "@/models/User";

// Simulated payment. Marking an order paid is also the only place stock is
// consumed, so the already-paid guard below is what keeps it from being applied
// twice.
export const PUT = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { id } = await req.json();

        await connectDb();

        const order: any = await Order.findById(id);

        // 404 rather than 403: a stranger should not learn that this id exists.
        if (!order || String(order.user) !== String(session.user.id)) {
            return NextResponse.json({ message: "Order not found" }, { status: 404 });
        }

        if (order.isPaid) {
            return NextResponse.json({ message: "This order is already paid." }, { status: 400 });
        }

        const user = await User.findById(session.user.id);

        order.isPaid = true;
        order.paidAt = new Date();
        order.status = "Processing";
        order.paymentResult = {
            id: `sim_${crypto.randomBytes(12).toString("hex")}`,
            status: "COMPLETED",
            email: user?.email,
        };

        await order.save();

        for (const line of order.products) {
            const product: any = await Product.findById(line.product);

            if (!product) {
                continue;
            }

            // The line's image is the variant's own first image, so it identifies
            // the variant exactly; two variants of one product can share a colour
            // hex, which would otherwise decrement the wrong one.
            const subProduct =
                product.subProducts.find((sub: any) => sub.images?.[0]?.url === line.image) ||
                product.subProducts.find(
                    (sub: any) =>
                        sub.color?.color === line.color?.color &&
                        (sub.color?.image || "") === (line.color?.image || "")
                ) ||
                product.subProducts.find((sub: any) =>
                    sub.sizes.some((size: any) => size.size === line.size)
                );

            if (!subProduct) {
                continue;
            }

            const sizeRow = subProduct.sizes.find((size: any) => size.size === line.size);

            if (!sizeRow) {
                continue;
            }

            sizeRow.qty = Math.max(0, sizeRow.qty - line.qty);
            subProduct.sold = (subProduct.sold || 0) + line.qty;

            await product.save();
        }

        await Cart.deleteOne({ user: order.user });

        const updated = await Order.findById(order._id)
            .populate({ path: "user", model: User })
            .populate({ path: "products.product", model: Product, select: "slug" })
            .lean();

        return NextResponse.json(JSON.parse(JSON.stringify(updated)));
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
