import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import connectDb from "@/lib/db";
import User from "@/models/User";
import { passwordIssue } from "@/lib/authRules";

export const PUT = async (req: Request) => {
    try {
        const { token, password } = await req.json();
        const issue = passwordIssue(password);

        if (issue) {
            return NextResponse.json({ message: issue }, { status: 400 });
        }

        let payload: any;

        try {
            payload = jwt.verify(token, process.env.EMAIL_TOKEN_SECRET as string);
        } catch {
            return NextResponse.json({ message: "This reset link has expired or was already replaced. Ask for a new one.", code: "expired" }, { status: 400 });
        }

        await connectDb();

        const user = await User.findById(payload.id);

        if (!user) {
            return NextResponse.json({ message: "This reset link no longer matches an account.", code: "expired" }, { status: 400 });
        }

        // Targets exactly this user; a filterless update would reset everyone.
        await User.findByIdAndUpdate(user._id, { password: await bcrypt.hash(password, 12) });

        return NextResponse.json({ email: user.email, message: "Your password is changed. Sign in with the new one." });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
