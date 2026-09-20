import { NextResponse } from "next/server";

import connectDb from "@/lib/db";
import User from "@/models/User";
import { passwordResetToken } from "@/utils/tokens";
import { sendEmail } from "@/utils/sendEmails";
import passwordResetTemplate from "@/emails/passwordResetTemplate";

export const POST = async (req: Request) => {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: "please enter a email." }, { status: 400 });
        }

        await connectDb();

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ message: "This email does not exist." }, { status: 401 });
        }

        const token = passwordResetToken({ id: user._id.toString() });
        const url = `${process.env.BASE_URL}/auth/reset/${token}`;

        await sendEmail(email, url, "Reset password", "Password reset", passwordResetTemplate);

        return NextResponse.json({
            message: "Reset Link has been send to your account. please use it for reset your password.",
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
