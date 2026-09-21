import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";

// Empties `recentlyViewed` on the signed-in user. Nothing else on the document is
// touched, and the products themselves are untouched.
export const DELETE = async () => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        await connectDb();

        const result = await User.updateOne(
            { _id: session.user.id },
            { $set: { recentlyViewed: [] } }
        );

        if (!result.matchedCount) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Your browsing history has been removed." });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
