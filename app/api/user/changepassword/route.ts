import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { auth } from "@/auth";
import { passwordIssue } from "@/lib/authRules";
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

        // The same rules the form ticks off as you type.
        const issue = passwordIssue(new_password);

        if (issue) {
            return NextResponse.json({ message: issue }, { status: 400 });
        }

        await connectDb();

        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // A provider account has no password stored, so there is nothing to
        // compare against. Setting a first one goes through the email link.
        if (!user.password) {
            return NextResponse.json(
                {
                    message:
                        "This account signs in with Google or GitHub. Use \u201cEmail me a link\u201d to set a password.",
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
