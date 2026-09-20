import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import Cart from "@/models/Cart";
import Coupon from "@/models/Coupon";

export const POST = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { coupon } = await req.json();

        await connectDb();

        const checkCoupon: any = await Coupon.findOne({ coupon: String(coupon || "").toUpperCase() }).lean();

        if (!checkCoupon) {
            return NextResponse.json({ message: "Invalid Coupon." }, { status: 400 });
        }

        const today = new Date().toISOString().slice(0, 10);

        if (today < checkCoupon.startDate || today > checkCoupon.endDate) {
            return NextResponse.json({ message: "This coupon has expired." }, { status: 400 });
        }

        const user = await User.findById(session.user.id);
        const cart: any = await Cart.findOne({ user: user?._id });

        if (!cart) {
            return NextResponse.json({ message: "Cart not found" }, { status: 404 });
        }

        // The price that remains after the discount, not the discount itself.
        const totalAfterDiscount = Number(
            (cart.cartTotal - cart.cartTotal * checkCoupon.discount / 100).toFixed(2)
        );

        cart.totalAfterDiscount = totalAfterDiscount;
        await cart.save();

        return NextResponse.json({ totalAfterDiscount, discount: checkCoupon.discount });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
