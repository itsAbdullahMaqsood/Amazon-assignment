import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import connectDb from "@/lib/db";
import User from "@/models/User";

export const PUT = async (req: Request) => {
    try {
        const { token, password } = await req.json();

        const payload: any = jwt.verify(token, process.env.EMAIL_TOKEN_SECRET as string);

        await connectDb();

        const user = await User.findById(payload.id);

        if (!user) {
            return NextResponse.json({ message: "this account doesn't exist." }, { status: 400 });
        }

        // Targets exactly this user; a filterless update would reset everyone.
        await User.findByIdAndUpdate(user._id, { password: await bcrypt.hash(password, 12) });

        return NextResponse.json({ email: user.email, message: "password successfully reset." });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
