import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import { PREFERENCE_COOKIE, defaultPreferences, encodePreferences } from "@/lib/preferences";

// The preferences are kept on the account and mirrored into a cookie, so a
// server render can apply them on the first paint — including for a visitor who
// is not signed in, and who therefore only gets the cookie.
export const PUT = async (req: Request) => {
    try {
        const body = await req.json();
        const values = Object.fromEntries(
            Object.keys(defaultPreferences).map((key) => [key, Boolean(body?.[key])])
        );

        const session = await auth();

        if (session) {
            await connectDb();
            await User.updateOne({ _id: session.user.id }, { $set: { preferences: values } });
        }

        const response = NextResponse.json({ preferences: values, message: "Preferences saved." });

        response.cookies.set(PREFERENCE_COOKIE, encodePreferences(values), {
            path: "/",
            maxAge: 31536000,
            sameSite: "lax",
        });

        return response;
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
