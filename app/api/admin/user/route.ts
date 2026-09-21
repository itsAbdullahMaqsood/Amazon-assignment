import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDb from "@/lib/db";
import { requireAdmin } from "@/lib/guard";
import User from "@/models/User";
import { ROLES, USER_FIELDS } from "@/components/admin/users/queries";

const bad = (message: string, status = 400) => NextResponse.json({ message }, { status });

// PUT { id, role } -> { message, user }. Role is the only thing an admin may change here.
export const PUT = async (req: Request) => {
    const { error, who } = await requireAdmin();
    if (error) return error;

    try {
        let body: any = {};
        try {
            body = (await req.json()) || {};
        } catch {}

        if (!mongoose.isValidObjectId(body.id)) return bad("User not found.", 404);
        if (!ROLES.includes(body.role)) return bad('Role must be "user" or "admin".');

        // Stops an admin locking themselves out, or the last admin demoting themselves.
        if (String(body.id) === String(who.user._id)) {
            return bad("You can't change your own role. Ask another admin to do it.");
        }

        await connectDb();

        const user: any = await User.findByIdAndUpdate(body.id, { role: body.role }, { returnDocument: "after" })
            .select(USER_FIELDS)
            .lean();

        if (!user) return bad("User not found.", 404);

        return NextResponse.json({
            message: `${user.name} is now ${user.role === "admin" ? "an admin" : "a regular user"}.`,
            user: JSON.parse(JSON.stringify(user)),
        });
    } catch (err: any) {
        return bad(err.message, 500);
    }
};
