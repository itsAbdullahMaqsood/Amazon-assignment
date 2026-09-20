import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";

const allowed = ["paypal", "credit_card", "cash"];

export const PUT = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { paymentMethod } = await req.json();

        if (!allowed.includes(paymentMethod)) {
            return NextResponse.json({ message: "Unknown payment method." }, { status: 400 });
        }

        await connectDb();

        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        user.defaultPaymentMethod = paymentMethod;
        await user.save();

        return NextResponse.json({
            defaultPaymentMethod: user.defaultPaymentMethod,
            message: "Default payment method saved.",
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
