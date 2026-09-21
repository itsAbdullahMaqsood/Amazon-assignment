import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";

// The role in the JWT is whatever it was at sign-in, so a demoted admin would
// keep admin rights until their session expired. Every admin decision reads the
// role from the database instead.
export const currentUser = async () => {
    const session = await auth();

    if (!session?.user?.id) {
        return null;
    }

    await connectDb();

    const user: any = await User.findById(session.user.id).select("name email role image").lean();

    return user ? { session, user } : null;
};

export const isAdmin = (who: any) => who?.user?.role === "admin";

// For route handlers: either the signed-in admin, or the response to send back.
export const requireAdmin = async () => {
    const who = await currentUser();

    if (!who) {
        return { error: NextResponse.json({ message: "Please sign in." }, { status: 401 }) };
    }

    if (!isAdmin(who)) {
        return { error: NextResponse.json({ message: "Admins only." }, { status: 403 }) };
    }

    return { who };
};
