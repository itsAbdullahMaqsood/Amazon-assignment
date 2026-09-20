import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";

export const PUT = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { id } = await req.json();

        await connectDb();

        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        user.address.forEach((address: any) => {
            address.active = String(address._id) === String(id);
        });

        await user.save();

        return NextResponse.json({ addresses: user.address });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

export const DELETE = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { id } = await req.json();

        await connectDb();

        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        user.address = user.address.filter((address: any) => String(address._id) !== String(id));
        await user.save();

        return NextResponse.json({ addresses: user.address });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
