import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDb from "@/lib/db";
import { requireAdmin } from "@/lib/guard";
import { adjustStock } from "@/lib/stock";
import { refuseReason } from "@/lib/adminOrders";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

const loadOrder = (id: string) =>
    Order.findById(id)
        .populate({ path: "user", model: User, select: "name email image" })
        .lean();

export const GET = async (_req: Request, { params }: any) => {
    const { error } = await requireAdmin();

    if (error) {
        return error;
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
        return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    await connectDb();

    const order = await loadOrder(id);

    if (!order) {
        return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    return NextResponse.json(JSON.parse(JSON.stringify(order)));
};

// Body: { status }. Moves the order along the rules in lib/adminOrders.ts.
export const PUT = async (req: Request, { params }: any) => {
    const { error } = await requireAdmin();

    if (error) {
        return error;
    }

    try {
        const { id } = await params;
        const body = await req.json().catch(() => ({}));
        const next = typeof body?.status === "string" ? body.status : "";

        if (!mongoose.isValidObjectId(id)) {
            return NextResponse.json({ message: "Order not found." }, { status: 404 });
        }

        await connectDb();

        const order: any = await Order.findById(id).select("status isPaid").lean();

        if (!order) {
            return NextResponse.json({ message: "Order not found." }, { status: 404 });
        }

        const reason = refuseReason(order, next);

        if (reason) {
            return NextResponse.json({ message: reason }, { status: 400 });
        }

        const set: any = { status: next };

        // Completed means delivered, so it stamps deliveredAt. It deliberately
        // does not touch isPaid: every order in this store is paid through the
        // payment route (cash included), which is also what takes stock and
        // records the paymentResult. Flipping isPaid here would claim money
        // nobody recorded and leave inventory that was never taken; instead
        // unpaid orders are refused anything but cancellation (see refuseReason).
        if (next === "Completed") {
            set.deliveredAt = new Date();
        }

        // Compare-and-set on the status we just validated: if two requests race
        // (say, two cancel clicks), only one matches, so the stock below is
        // restored at most once. Cancelled is terminal, so it can never be
        // reached a second time either.
        const updated: any = await Order.findOneAndUpdate(
            { _id: id, status: order.status },
            { $set: set },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json(
                { message: "This order changed while you were editing it. Reload and try again." },
                { status: 409 }
            );
        }

        // Payment is the only thing that takes stock, so only a paid order has
        // any to give back.
        if (next === "Cancelled" && updated.isPaid) {
            await adjustStock(Product, updated, 1);
        }

        return NextResponse.json(JSON.parse(JSON.stringify(await loadOrder(id))));
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
};
