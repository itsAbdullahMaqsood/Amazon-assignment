import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDb from "@/lib/db";
import { requireAdmin } from "@/lib/guard";
import Coupon from "@/models/Coupon";
import { couponSchema } from "@/components/admin/coupons/schema";
import { listCoupons, todayString } from "@/components/admin/coupons/queries";

const bad = (message: string, status = 400) => NextResponse.json({ message }, { status });

const readBody = async (req: Request) => {
    try {
        return (await req.json()) || {};
    } catch {
        return {};
    }
};

const clashMessage = (code: string) => `A coupon with the code "${code}" already exists.`;

// The first zod issue is enough: the form already shows them field by field.
const parse = (body: any) => {
    const result = couponSchema.safeParse(body);

    return result.success ? { values: result.data } : { error: result.error.issues[0]?.message || "Check the coupon details." };
};

const respond = async (message: string, coupon?: any) =>
    NextResponse.json({ message, coupon, coupons: await listCoupons(), today: todayString() });

// POST { coupon, discount, startDate, endDate }
export const POST = async (req: Request) => {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const parsed: any = parse(await readBody(req));
        if (parsed.error) return bad(parsed.error);

        await connectDb();

        if (await Coupon.exists({ coupon: parsed.values.coupon })) {
            return bad(clashMessage(parsed.values.coupon));
        }

        const coupon = await Coupon.create(parsed.values);

        return respond(`Coupon ${coupon.coupon} created.`, coupon);
    } catch (err: any) {
        if (err?.code === 11000) return bad("A coupon with that code already exists.");
        return bad(err.message, 500);
    }
};

// PUT { id, coupon, discount, startDate, endDate }
export const PUT = async (req: Request) => {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const body = await readBody(req);
        if (!mongoose.isValidObjectId(body.id)) return bad("Coupon not found.", 404);

        const parsed: any = parse(body);
        if (parsed.error) return bad(parsed.error);

        await connectDb();

        const coupon: any = await Coupon.findById(body.id);
        if (!coupon) return bad("Coupon not found.", 404);

        if (await Coupon.exists({ coupon: parsed.values.coupon, _id: { $ne: body.id } })) {
            return bad(clashMessage(parsed.values.coupon));
        }

        coupon.set(parsed.values);
        await coupon.save();

        return respond(`Coupon ${coupon.coupon} saved.`, coupon);
    } catch (err: any) {
        if (err?.code === 11000) return bad("A coupon with that code already exists.");
        return bad(err.message, 500);
    }
};

// DELETE { id }
export const DELETE = async (req: Request) => {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const body = await readBody(req);
        if (!mongoose.isValidObjectId(body.id)) return bad("Coupon not found.", 404);

        await connectDb();

        const coupon: any = await Coupon.findByIdAndDelete(body.id).select("coupon").lean();
        if (!coupon) return bad("Coupon not found.", 404);

        return respond(`Coupon ${coupon.coupon} deleted.`);
    } catch (err: any) {
        return bad(err.message, 500);
    }
};
