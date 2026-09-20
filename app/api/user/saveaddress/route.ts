import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";

export const POST = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { address } = await req.json();

        await connectDb();

        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // The first address a user saves becomes the active one.
        user.address.push({ ...address, active: user.address.length === 0 });
        await user.save();

        return NextResponse.json({ addresses: user.address });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
