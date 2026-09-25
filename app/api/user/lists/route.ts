import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import { privacyOptions, toList, validateName } from "@/lib/lists";

const names = (user: any, exceptId = "") =>
    (user.lists || []).filter((list: any) => String(list._id) !== String(exceptId)).map((list: any) => list.name);

const shaped = (user: any) => (user.lists || []).map(toList);

const owner = async (session: any) => {
    await connectDb();

    return User.findById(session.user.id);
};

export const GET = async () => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const user: any = await owner(session);

        return NextResponse.json({ lists: user ? shaped(user) : [] });
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
        const user: any = await owner(session);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // The sheet checks the same rules, but the route is the one that owns them.
        const invalid = validateName(String(name || ""), names(user));

        if (invalid) {
            return NextResponse.json({ message: invalid }, { status: 400 });
        }

        const allowed = privacyOptions.some((option) => option.value === privacy);

        user.lists.push({ name: String(name).trim(), privacy: allowed ? privacy : "private", items: [], createdAt: new Date() });
        await user.save();

        const created = user.lists[user.lists.length - 1];

        return NextResponse.json({ lists: shaped(user), id: String(created._id), message: "List created." });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

// Renaming a list, or changing who can see it.
export const PATCH = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { list_id, name, privacy } = await req.json();
        const user: any = await owner(session);
        const list = user?.lists?.id(list_id);

        if (!list) {
            return NextResponse.json({ message: "That list is no longer on your account." }, { status: 404 });
        }

        if (name !== undefined) {
            const invalid = validateName(String(name || ""), names(user, list_id));

            if (invalid) {
                return NextResponse.json({ message: invalid }, { status: 400 });
            }

            list.name = String(name).trim();
        }

        if (privacy !== undefined && privacyOptions.some((option) => option.value === privacy)) {
            list.privacy = privacy;
        }

        await user.save();

        return NextResponse.json({ lists: shaped(user), message: "List updated." });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

// Adding a product to a list. The same product and colour can only be on a list
// once, so adding it twice is not an error and not a duplicate.
export const PUT = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { list_id, product_id, style } = await req.json();
        const user: any = await owner(session);
        const list = user?.lists?.id(list_id);

        if (!list) {
            return NextResponse.json({ message: "That list is no longer on your account." }, { status: 404 });
        }

        const product = await Product.findById(product_id).select("_id name").lean();

        if (!product) {
            return NextResponse.json({ message: "Product not found." }, { status: 404 });
        }

        const known = list.items.some(
            (item: any) => String(item.product) === String(product_id) && String(item.style) === String(style ?? 0)
        );

        if (!known) {
            list.items.push({ product: product_id, style: String(style ?? 0), addedAt: new Date() });
            await user.save();
        }

        return NextResponse.json({
            lists: shaped(user),
            message: known ? `Already on ${list.name}.` : `Added to ${list.name}.`,
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

// With an item id, removes that item; without one, deletes the whole list.
export const DELETE = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { list_id, item_id } = await req.json();
        const user: any = await owner(session);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (item_id) {
            const list = user.lists.id(list_id);

            if (!list) {
                return NextResponse.json({ message: "That list is no longer on your account." }, { status: 404 });
            }

            list.items = list.items.filter((item: any) => String(item._id) !== String(item_id));
            await user.save();

            return NextResponse.json({ lists: shaped(user), message: "Removed from the list." });
        }

        user.lists = user.lists.filter((list: any) => String(list._id) !== String(list_id));
        await user.save();

        return NextResponse.json({ lists: shaped(user), message: "List deleted." });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
