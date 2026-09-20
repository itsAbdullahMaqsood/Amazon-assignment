import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";

// Neither password is ever logged.
export const PUT = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { current_password, new_password } = await req.json();

        if (!new_password || new_password.length < 6) {
            return NextResponse.json(
                { message: "New password must be at least 6 characters." },
                { status: 400 }
            );
        }

        await connectDb();

        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // OAuth accounts carry a random hash they were never told, so there is no
        // current password to compare against.
        if (!user.password) {
            return NextResponse.json(
                {
                    message:
                        "This account signs in with Google or GitHub, so it has no password to change.",
                },
                { status: 400 }
            );
        }

        if (!(await bcrypt.compare(String(current_password || ""), user.password))) {
            return NextResponse.json({ message: "Current password is incorrect." }, { status: 400 });
        }

        user.password = await bcrypt.hash(new_password, 12);
        await user.save();

        return NextResponse.json({ message: "Password changed successfully." });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
