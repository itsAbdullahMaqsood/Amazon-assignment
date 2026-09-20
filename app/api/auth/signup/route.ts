import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import connectDb from "@/lib/db";
import User from "@/models/User";
import { validateEmail } from "@/utils/validation";
import { createActivationToken } from "@/utils/tokens";
import { sendEmail } from "@/utils/sendEmails";
import activateEmailTemplate from "@/emails/activateEmailTemplate";

export const POST = async (req: Request) => {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ message: "Please fill in all fields." }, { status: 400 });
        }

        if (!validateEmail(email)) {
            return NextResponse.json({ message: "invalid email." }, { status: 400 });
        }

        await connectDb();

        if (await User.findOne({ email })) {
            return NextResponse.json({ message: "this email already exits." }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: "password must be at least 6 characters." },
                { status: 400 }
            );
        }

        const newUser = await new User({
            name,
            email,
            password: await bcrypt.hash(password, 12),
        }).save();

        const token = createActivationToken({ id: newUser._id.toString() });
        const url = `${process.env.BASE_URL}/auth/activate/${token}`;

        await sendEmail(email, url, "Confirm your account", "Verify your email address", activateEmailTemplate);

        return NextResponse.json({
            message: "Register success! please activate your email to start.",
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
