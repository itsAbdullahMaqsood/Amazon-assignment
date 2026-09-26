import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import { forgetSessionVersion } from "@/lib/sessionVersion";

// DELETE /api/user/sessions — sign out everywhere.
//
// Raising `sessionVersion` is what does it: every token already issued carries
// the old number, and the jwt callback refuses those on the next request. The
// list of browsers is cleared with it, because none of them are signed in any
// more — including this one.
export const DELETE = async () => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        await connectDb();

        const result = await User.updateOne(
            { _id: session.user.id },
            { $inc: { sessionVersion: 1 }, $set: { signIns: [] } }
        );

        if (!result.matchedCount) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        forgetSessionVersion(session.user.id);

        return NextResponse.json({ message: "Signed out everywhere. You'll need to sign in again." });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
