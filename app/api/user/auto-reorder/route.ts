import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import { WEEK_OPTIONS, nextDueDate } from "@/lib/autoReorder";
import { getAutoReorder } from "@/lib/autoReorderQueries";

const load = async (userId: string) => getAutoReorder(userId);

const valid = (weeks: any) => WEEK_OPTIONS.some((option) => option.value === Number(weeks));

export const GET = async () => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        await connectDb();

        return NextResponse.json({ schedules: await load(session.user.id) });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

// POST { product_id, style, size, everyWeeks } — start repeating something you
// have bought. The next date is worked out here, never sent by the browser.
export const POST = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { product_id, style, size, everyWeeks } = await req.json();

        if (!valid(everyWeeks)) {
            return NextResponse.json({ message: "Choose how often it should repeat." }, { status: 400 });
        }

        await connectDb();

        const product = await Product.findById(product_id).select("name").lean();

        if (!product) {
            return NextResponse.json({ message: "Product not found." }, { status: 404 });
        }

        const user: any = await User.findById(session.user.id).select("autoReorder");

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const known = user.autoReorder.find(
            (entry: any) => String(entry.product) === String(product_id) && String(entry.size || "") === String(size || "")
        );

        if (known) {
            return NextResponse.json({ message: "That one already repeats." }, { status: 400 });
        }

        user.autoReorder.push({
            product: product_id,
            style: Number(style) || 0,
            size: String(size || ""),
            everyWeeks: Number(everyWeeks),
            nextAt: nextDueDate(new Date(), Number(everyWeeks)),
            createdAt: new Date(),
        });

        await user.save();

        return NextResponse.json({ schedules: await load(session.user.id), message: "Repeat added." });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

// PATCH { id, everyWeeks } changes how often; PATCH { id, snooze: true } moves
// the next date on by one interval, which is what "I have this covered" means.
export const PATCH = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { id, everyWeeks, snooze } = await req.json();

        await connectDb();

        const user: any = await User.findById(session.user.id).select("autoReorder");
        const entry = user?.autoReorder?.id(id);

        if (!entry) {
            return NextResponse.json({ message: "That repeat is no longer on your account." }, { status: 404 });
        }

        if (everyWeeks !== undefined) {
            if (!valid(everyWeeks)) {
                return NextResponse.json({ message: "Choose how often it should repeat." }, { status: 400 });
            }

            entry.everyWeeks = Number(everyWeeks);
            entry.nextAt = nextDueDate(new Date(), entry.everyWeeks);
        }

        if (snooze) {
            entry.nextAt = nextDueDate(new Date(entry.nextAt) > new Date() ? new Date(entry.nextAt) : new Date(), entry.everyWeeks);
        }

        await user.save();

        return NextResponse.json({ schedules: await load(session.user.id), message: "Repeat updated." });
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

        const user: any = await User.findById(session.user.id).select("autoReorder");

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        user.autoReorder = user.autoReorder.filter((entry: any) => String(entry._id) !== String(id));
        await user.save();

        return NextResponse.json({ schedules: await load(session.user.id), message: "Repeat stopped." });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
