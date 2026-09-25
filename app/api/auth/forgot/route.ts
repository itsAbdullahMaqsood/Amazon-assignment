import { NextResponse } from "next/server";

import connectDb from "@/lib/db";
import User from "@/models/User";
import { emailQuery } from "@/lib/authRules";
import { siteUrl } from "@/lib/site";
import { passwordResetToken } from "@/utils/tokens";
import { sendEmail } from "@/utils/sendEmails";
import passwordResetTemplate from "@/emails/passwordResetTemplate";

export const POST = async (req: Request) => {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: "Enter your email." }, { status: 400 });
        }

        await connectDb();

        const user: any = await User.findOne(emailQuery(email));

        // The same answer whether or not the account exists, so this form can't
        // be used to find out who shops here.
        if (user) {
            const token = passwordResetToken({ id: user._id.toString() });
            await sendEmail(user.email, `${siteUrl()}/auth/reset/${token}`, "Reset password", "Reset your Markaz password", passwordResetTemplate);
        }

        return NextResponse.json({
            message: "If an account uses that email, a reset link is on its way. It expires in 6 hours.",
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
