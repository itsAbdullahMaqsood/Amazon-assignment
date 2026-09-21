import { NextResponse } from "next/server";
import crypto from "crypto";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Cart from "@/models/Cart";
import User from "@/models/User";
import { adjustStock } from "@/lib/stock";

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

        await adjustStock(Product, order, -1);

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
