import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/models/Order";
import { isReturnable, qtyReturnable, refundMethods, returnReasons } from "@/lib/returns";

// Every field that ends up on the request is either derived from the order
// document or checked against the lists in lib/returns: the client only picks a
// line, a reason and a refund destination.
export const POST = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { orderId, line, reason, comments, refundTo, qty } = await req.json();

        if (!mongoose.isValidObjectId(orderId)) {
            return NextResponse.json({ message: "That order does not exist." }, { status: 404 });
        }

        if (!returnReasons.includes(reason)) {
            return NextResponse.json({ message: "Please choose a return reason." }, { status: 400 });
        }

        if (!refundMethods.some((method) => method.value === refundTo)) {
            return NextResponse.json({ message: "Please choose a refund method." }, { status: 400 });
        }

        await connectDb();

        // Scoped to the session user, so an id guessed from elsewhere finds nothing.
        const owned: any = { _id: orderId, user: session.user.id };
        const order: any = await Order.findOne(owned);

        if (!order) {
            return NextResponse.json({ message: "That order does not exist." }, { status: 404 });
        }

        const index = Number(line);
        const product = order.products?.[index];

        if (!Number.isInteger(index) || index < 0 || !product) {
            return NextResponse.json({ message: "That item is not on this order." }, { status: 400 });
        }

        if (!isReturnable(order)) {
            return NextResponse.json(
                { message: "This order is outside the 30-day return window." },
                { status: 400 }
            );
        }

        const remaining = qtyReturnable(order, index);

        if (remaining < 1) {
            return NextResponse.json(
                { message: "A return has already been requested for this item." },
                { status: 409 }
            );
        }

        const requested = Math.min(Math.max(Number(qty) || 1, 1), remaining);

        order.returnRequests.push({
            line: index,
            name: product.name,
            image: product.image,
            qty: requested,
            reason,
            comments: String(comments || "").trim().slice(0, 500),
            refundTo,
            status: "Return requested",
            requestedAt: new Date(),
        });

        await order.save();

        const saved = order.returnRequests[order.returnRequests.length - 1];

        return NextResponse.json({
            message: "Your return request has been submitted.",
            returnRequest: JSON.parse(JSON.stringify(saved)),
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

export const GET = async () => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        await connectDb();

        const clause: any = { user: session.user.id, "returnRequests.0": { $exists: true } };

        const orders: any = await Order.find(clause)
            .select("returnRequests createdAt")
            .sort({ createdAt: -1 })
            .lean();

        const returns = orders.flatMap((order: any) =>
            (order.returnRequests || []).map((request: any) => ({
                ...request,
                orderId: String(order._id),
            }))
        );

        return NextResponse.json({ returns: JSON.parse(JSON.stringify(returns)) });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
