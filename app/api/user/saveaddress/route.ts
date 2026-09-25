import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import { addressSchema } from "@/lib/address";

export const POST = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { address } = await req.json();
        const parsed = addressSchema.safeParse(address || {});

        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0]?.message || "Check the address." }, { status: 400 });
        }

        await connectDb();

        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // A new address becomes the one in use: it was just typed for a reason.
        user.address.forEach((entry: any) => {
            entry.active = false;
        });
        user.address.push({ ...parsed.data, active: true });
        await user.save();

        return NextResponse.json({ addresses: user.address });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

// Editing an address in place, so correcting a typo does not leave a duplicate
// behind. The same schema validates it, and whether it is the active address is
// not something the body can change.
export const PUT = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { id, address } = await req.json();
        const parsed = addressSchema.safeParse(address || {});

        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0]?.message || "Check the address." }, { status: 400 });
        }

        await connectDb();

        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const existing = user.address.id(id);

        if (!existing) {
            return NextResponse.json({ message: "That address is no longer on your account." }, { status: 404 });
        }

        existing.set(parsed.data);
        await user.save();

        return NextResponse.json({ addresses: user.address });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
