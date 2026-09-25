import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { computeQuote } from "@/lib/checkout";

// The checkout page's live summary: the same numbers order creation will
// charge, for the coupon and gift-card choice on screen.
export const POST = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { coupon, useGiftCard } = await req.json();
        const quote = await computeQuote(session.user.id, { coupon, useGiftCard: useGiftCard !== false });

        if (!quote) {
            return NextResponse.json({ message: "Your cart is empty." }, { status: 404 });
        }

        return NextResponse.json(quote);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
