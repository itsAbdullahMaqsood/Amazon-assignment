import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import Cart from "@/models/Cart";
import Coupon from "@/models/Coupon";
import Order from "@/models/Order";

// Products and totals come from the user's Cart document only; the request body
// contributes the shipping address, the payment method and a coupon code that is
// re-checked here.
export const POST = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { shippingAddress, paymentMethod, couponApplied, useGiftCard } = await req.json();

        await connectDb();

        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const cart: any = await Cart.findOne({ user: user._id });

        if (!cart || !cart.products.length) {
            return NextResponse.json({ message: "Cart not found" }, { status: 404 });
        }

        let total = cart.cartTotal;
        let validCoupon = "";

        if (couponApplied) {
            const checkCoupon: any = await Coupon.findOne({
                coupon: String(couponApplied).toUpperCase(),
            }).lean();

            const today = new Date().toISOString().slice(0, 10);

            if (checkCoupon && today >= checkCoupon.startDate && today <= checkCoupon.endDate) {
                total = Number((cart.cartTotal - cart.cartTotal * checkCoupon.discount / 100).toFixed(2));
                validCoupon = checkCoupon.coupon;
            }
        }

        // The balance is spent here, never on the client: the request only says
        // whether to use it.
        let giftCardApplied = 0;

        if (useGiftCard && user.giftCardBalance > 0) {
            giftCardApplied = Number(Math.min(user.giftCardBalance, total).toFixed(2));
            total = Number((total - giftCardApplied).toFixed(2));

            user.giftCardBalance = Number((user.giftCardBalance - giftCardApplied).toFixed(2));
            user.giftCardHistory.push({ code: "", amount: giftCardApplied, type: "used", at: new Date() });
            await user.save();
        }

        const order = await new Order({
            user: user._id,
            products: cart.products,
            shippingAddress,
            paymentMethod,
            total,
            totalBeforeDiscount: cart.cartTotal,
            couponApplied: validCoupon,
            giftCardApplied,
            shippingPrice: 0,
            taxPrice: 0,
            isPaid: false,
            status: "Not Processed",
        }).save();

        return NextResponse.json({ order_id: order._id });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
