import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";

// POST { list_id, item_id }
//
// Markaz cannot tell that an order was meant for a particular list — the cart
// carries no list with it — so "bought" is something the person who bought it
// says, here, and the record keeps who said so and when. Only a signed-in
// visitor can, and only on a list its owner made shared or public.
export const POST = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Sign in to mark a gift as bought." }, { status: 401 });
        }

        const { list_id, item_id } = await req.json();

        await connectDb();

        const owner: any = await User.findOne({ "lists._id": list_id });
        const list = owner?.lists?.id(list_id);

        if (!list || list.privacy === "private") {
            return NextResponse.json({ message: "That list can't be opened." }, { status: 404 });
        }

        const item = list.items.id(item_id);

        if (!item) {
            return NextResponse.json({ message: "That item is no longer on the list." }, { status: 404 });
        }

        const mine = String(item.purchasedBy || "") === String(session.user.id);

        if (item.purchasedAt && !mine) {
            return NextResponse.json({ message: "Someone else has already marked this one." }, { status: 400 });
        }

        // Your own mark is a toggle, so a mistake can be taken back.
        if (mine) {
            item.purchasedBy = undefined;
            item.purchasedAt = undefined;
        } else {
            item.purchasedBy = session.user.id;
            item.purchasedAt = new Date();
        }

        await owner.save();

        return NextResponse.json({
            bought: !mine,
            message: mine ? "Marked as not bought." : "Marked as bought, so nobody buys it twice.",
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
