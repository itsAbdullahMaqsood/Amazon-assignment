import { NextResponse } from "next/server";

import { auth, signOut } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import Cart from "@/models/Cart";
import Order from "@/models/Order";

// DELETE /api/user/account
//
// Closing an account is irreversible, so the request has to carry both the
// explicit confirm flag and the account's own email address, typed by the person
// in the second step of the dialog. A stray fetch without a body cannot fire it.
export const DELETE = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        let body: any = {};

        try {
            body = await req.json();
        } catch {
            body = {};
        }

        if (body?.confirm !== true) {
            return NextResponse.json(
                { message: "Confirm the closure before this account can be closed." },
                { status: 400 }
            );
        }

        const typed = String(body?.email || "").trim().toLowerCase();

        if (!typed || typed !== String(session.user.email || "").toLowerCase()) {
            return NextResponse.json(
                { message: "The email address you typed does not match this account." },
                { status: 400 }
            );
        }

        await connectDb();

        const user = await User.findById(session.user.id).select("_id");

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Orders are financial records and their `user` reference is required by the
        // schema, so they are left exactly as they are rather than anonymised. The
        // dialog tells the customer this before they confirm.
        const keptOrders = await Order.countDocuments({ user: session.user.id });

        await Cart.deleteMany({ user: session.user.id });
        await User.deleteOne({ _id: session.user.id });

        // Drop the session cookie here as well; the client signs out too, so the
        // session cannot outlive the document either way.
        try {
            await signOut({ redirect: false });
        } catch {
            // next-auth throws when it cannot write the cookie from this context.
        }

        return NextResponse.json({
            message: "Your account has been closed.",
            keptOrders,
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
