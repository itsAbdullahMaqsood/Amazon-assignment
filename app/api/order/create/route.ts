import { NextResponse } from "next/server";
import crypto from "crypto";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import Cart from "@/models/Cart";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { computeQuote } from "@/lib/checkout";
import { PAYMENT_IDS, paidOnPlacement } from "@/lib/payments";
import { adjustStock } from "@/lib/stock";
import { siteUrl } from "@/lib/site";
import { sendHtmlEmail } from "@/utils/sendEmails";
import orderConfirmationTemplate from "@/emails/orderConfirmationTemplate";

// Places an order in one step. Lines, prices, delivery, the coupon and the
// gift card all come from computeQuote, the same function behind the checkout
// summary, so what the shopper saw is what is charged. The request only chooses
// a saved address, a payment method, a coupon code and whether to spend the
// gift card balance.
//
// Card and PayPal are simulated and paid on placement: the order is marked
// paid, stock is taken and the gift card spent in this request. Cash on
// delivery is placed unpaid; it still spends the gift card, because that part
// of the order is settled now.
export const POST = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { addressId, paymentMethod, coupon, useGiftCard } = await req.json();

        if (!PAYMENT_IDS.includes(paymentMethod)) {
            return NextResponse.json({ message: "Choose a payment method." }, { status: 400 });
        }

        await connectDb();

        const user: any = await User.findById(session.user.id).select("email address").lean();
        const address = (user?.address || []).find((entry: any) => String(entry._id) === String(addressId));

        if (!address) {
            return NextResponse.json({ message: "Choose a delivery address." }, { status: 400 });
        }

        const quote = await computeQuote(session.user.id, { coupon, useGiftCard: useGiftCard !== false });

        if (!quote) {
            return NextResponse.json({ message: "Your cart is empty." }, { status: 404 });
        }

        if (quote.problems.length) {
            return NextResponse.json({ message: quote.problems.join(" "), problems: quote.problems }, { status: 409 });
        }

        if (coupon && !quote.coupon) {
            return NextResponse.json({ message: quote.couponError || "That code can't be used." }, { status: 400 });
        }

        // The balance is spent with a guard on the stored value, so two tabs
        // placing orders at once cannot spend the same money twice.
        if (quote.giftCard > 0) {
            const spent = await User.updateOne(
                { _id: session.user.id, giftCardBalance: { $gte: quote.giftCard } },
                {
                    $inc: { giftCardBalance: -quote.giftCard },
                    $push: { giftCardHistory: { code: "", amount: quote.giftCard, type: "used", at: new Date() } },
                }
            );

            if (!spent.modifiedCount) {
                return NextResponse.json({ message: "Your gift card balance changed. Review the total and try again." }, { status: 409 });
            }
        }

        const paid = paidOnPlacement(paymentMethod);
        const { _id, active, ...shippingAddress } = address;

        const order = await new Order({
            user: session.user.id,
            products: quote.lines.map((line: any) => ({
                product: line.product,
                name: line.name,
                image: line.image,
                size: line.size,
                qty: line.qty,
                color: line.color,
                price: line.price,
            })),
            shippingAddress,
            paymentMethod,
            total: quote.total,
            shippingPrice: quote.shipping,
            totalBeforeDiscount: quote.subtotal,
            couponApplied: quote.coupon?.code || "",
            giftCardApplied: quote.giftCard,
            taxPrice: 0,
            isPaid: paid,
            paidAt: paid ? new Date() : undefined,
            status: paid ? "Processing" : "Not Processed",
            paymentResult: paid
                ? { id: `sim_${crypto.randomBytes(12).toString("hex")}`, status: "COMPLETED", email: user.email }
                : undefined,
        }).save();

        if (paid) {
            await adjustStock(Product, order, -1);
        }

        await Cart.deleteOne({ user: session.user.id });

        // The receipt. sendHtmlEmail never throws and never blocks the answer:
        // a placed order must not fail because SMTP is down, and the order page
        // is the record either way.
        void sendHtmlEmail(
            user.email,
            `Your Markaz order #${String(order._id).slice(-8).toUpperCase()}`,
            orderConfirmationTemplate(user.email, `${siteUrl()}/order/${order._id}`, JSON.parse(JSON.stringify(order))),
            `order confirmation for ${siteUrl()}/order/${order._id}`
        );

        return NextResponse.json({ order_id: order._id });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
