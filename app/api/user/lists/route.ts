import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import { privacyOptions, toList, validateName } from "@/lib/lists";

const loadLists = async (userId: string) => {
    const user: any = await User.findById(userId).select("lists").lean();

    return (user?.lists || []).map(toList);
};

export const GET = async () => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        await connectDb();

        return NextResponse.json({ lists: await loadLists(session.user.id) });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

export const POST = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { name, privacy } = await req.json();

        await connectDb();

        const user: any = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // The modal checks the same rules, but the route is the one that owns them.
        const invalid = validateName(
            String(name || ""),
            (user.lists || []).map((list: any) => list.name)
        );

        if (invalid) {
            return NextResponse.json({ message: invalid }, { status: 400 });
        }

        const allowed = privacyOptions.some((option) => option.value === privacy);

        user.lists.push({
            name: String(name).trim(),
            privacy: allowed ? privacy : "private",
            items: [],
            createdAt: new Date(),
        });

        await user.save();

        return NextResponse.json({
            lists: (user.lists || []).map(toList),
            message: "List created.",
        });
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

        const { list_id } = await req.json();

        await connectDb();

        const user: any = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        user.lists = (user.lists || []).filter((list: any) => String(list._id) !== String(list_id));
        await user.save();

        return NextResponse.json({
            lists: (user.lists || []).map(toList),
            message: "List deleted.",
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
