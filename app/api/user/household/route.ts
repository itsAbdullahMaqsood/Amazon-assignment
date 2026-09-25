import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import { MAX_MEMBERS, memberIssue } from "@/lib/household";

const shaped = (user: any) => ({
    members: (user.household?.members || []).map((member: any) => ({
        _id: String(member._id),
        name: member.name,
        email: member.email,
        addedAt: member.addedAt,
    })),
    sharing: { delivery: user.household?.sharing?.delivery !== false },
});

export const POST = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { name, email } = await req.json();

        await connectDb();

        const user: any = await User.findById(session.user.id).select("email household");

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const members = user.household?.members || [];

        if (members.length >= MAX_MEMBERS) {
            return NextResponse.json({ message: `A household holds up to ${MAX_MEMBERS} people.` }, { status: 400 });
        }

        const issue = memberIssue(name, email, members.map((member: any) => member.email), user.email);

        if (issue) {
            return NextResponse.json({ message: issue }, { status: 400 });
        }

        user.household = {
            members: [...members, { name: String(name).trim(), email: String(email).trim().toLowerCase(), addedAt: new Date() }],
            sharing: { delivery: user.household?.sharing?.delivery !== false },
        };

        await user.save();

        return NextResponse.json({ household: shaped(user), message: "Added to your household." });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

// Turning delivery sharing off leaves the household intact but stops the people
// in it paying nothing for delivery, so it is worth its own control.
export const PATCH = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { delivery } = await req.json();

        await connectDb();

        const user: any = await User.findById(session.user.id).select("household");

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        user.household = {
            members: user.household?.members || [],
            sharing: { delivery: Boolean(delivery) },
        };

        await user.save();

        return NextResponse.json({ household: shaped(user), message: "Sharing updated." });
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

        const user: any = await User.findById(session.user.id).select("household");

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        user.household = {
            members: (user.household?.members || []).filter((member: any) => String(member._id) !== String(id)),
            sharing: { delivery: user.household?.sharing?.delivery !== false },
        };

        await user.save();

        return NextResponse.json({ household: shaped(user), message: "Removed from your household." });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
