import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";

// "New" is anything that happened since this moment, so marking the page read is
// one timestamp rather than a row per notice.
export const PUT = async () => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        await connectDb();

        const readAt = new Date();

        await User.updateOne({ _id: session.user.id }, { $set: { messagesReadAt: readAt } });

        return NextResponse.json({ readAt, message: "Marked as read." });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
