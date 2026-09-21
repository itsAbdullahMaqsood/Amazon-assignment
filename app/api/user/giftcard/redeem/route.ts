import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import { parseGiftCode } from "@/lib/giftcards";

// POST /api/user/giftcard/redeem  { code: "AMZN-0025-7975" }
//
// Claim codes are not stored anywhere before redemption: they are validated
// arithmetically, so the scheme is the whole card. A code is `AMZN-<amount>-<check>`
// where <amount> is the face value in whole dollars and <check> is
// (amount * 7919) mod 10000, both zero padded to four digits. See lib/giftcards.ts.
//
// Every dollar figure below is computed here rather than taken from the request,
// and a code that already appears in this account's giftCardHistory is refused,
// so the same card cannot be claimed twice.
export const POST = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { code } = await req.json();
        const parsed: any = parseGiftCode(code);

        if (parsed.error) {
            return NextResponse.json({ message: parsed.error }, { status: 400 });
        }

        await connectDb();

        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const history = user.giftCardHistory || [];

        if (history.some((entry: any) => entry.code === parsed.code)) {
            return NextResponse.json(
                { message: "This claim code has already been applied to your balance." },
                { status: 409 }
            );
        }

        user.giftCardBalance = Number(
            (Number(user.giftCardBalance || 0) + parsed.amount).toFixed(2)
        );
        user.giftCardHistory = [
            ...history,
            { code: parsed.code, amount: parsed.amount, type: "redeemed", at: new Date() },
        ];

        await user.save();

        return NextResponse.json({
            amount: parsed.amount,
            balance: user.giftCardBalance,
            history: JSON.parse(JSON.stringify(user.giftCardHistory)),
            message: `$${parsed.amount.toFixed(2)} was added to your gift card balance.`,
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
