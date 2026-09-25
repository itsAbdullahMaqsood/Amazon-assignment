import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import * as z from "zod";

import connectDb from "@/lib/db";
import User from "@/models/User";
import { createActivationToken } from "@/utils/tokens";
import { sendEmail } from "@/utils/sendEmails";
import activateEmailTemplate from "@/emails/activateEmailTemplate";
import { emailQuery, emailSchema, normaliseEmail, passwordSchema } from "@/lib/authRules";
import { siteUrl } from "@/lib/site";

const schema = z.object({
    name: z.string().trim().min(2, "Enter your name.").max(50, "Keep your name under 50 characters."),
    email: emailSchema,
    password: passwordSchema,
});

// The same rules the form shows, checked again here.
export const POST = async (req: Request) => {
    try {
        const parsed = schema.safeParse(await req.json());

        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0]?.message || "Check the form." }, { status: 400 });
        }

        const { name, password } = parsed.data;
        const email = normaliseEmail(parsed.data.email);

        await connectDb();

        if (await User.findOne(emailQuery(email))) {
            return NextResponse.json(
                { message: "An account already uses this email. Sign in, or reset the password if you've forgotten it.", code: "exists" },
                { status: 409 }
            );
        }

        const newUser = await new User({
            name,
            email,
            password: await bcrypt.hash(password, 12),
        }).save();

        const token = createActivationToken({ id: newUser._id.toString() });

        await sendEmail(email, `${siteUrl()}/auth/activate/${token}`, "Confirm your email", "Confirm your Markaz account", activateEmailTemplate);

        return NextResponse.json({ message: "Account created. We've sent a link to confirm your email." });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
