import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import Cart from "@/models/Cart";
import Order from "@/models/Order";
import Product from "@/models/Product";

// The picker on /profile/data offers exactly these.
const categories = ["account", "orders", "history", "all"];

// The password hash is never selected, so it cannot leak into an export.
const ACCOUNT_FIELDS = "name email role image emailVerified defaultPaymentMethod address createdAt updatedAt";

const accountSection = async (userId: string) => {
    const user: any = await User.findById(userId).select(ACCOUNT_FIELDS).lean();

    if (!user) {
        return null;
    }

    return {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        emailVerified: user.emailVerified,
        defaultPaymentMethod: user.defaultPaymentMethod || null,
        addresses: user.address || [],
        accountCreated: user.createdAt,
        accountUpdated: user.updatedAt,
        note: "Your password is stored only as a bcrypt hash and is never included in an export.",
    };
};

const ordersSection = async (userId: string) => {
    const orders: any[] = await Order.find({ user: userId }).sort({ createdAt: -1 }).lean();

    return orders.map((order: any) => ({
        id: String(order._id),
        placedAt: order.createdAt,
        status: order.status,
        isPaid: order.isPaid,
        paidAt: order.paidAt || null,
        deliveredAt: order.deliveredAt || null,
        paymentMethod: order.paymentMethod || null,
        total: order.total,
        shippingPrice: order.shippingPrice,
        taxPrice: order.taxPrice,
        couponApplied: order.couponApplied || null,
        shippingAddress: order.shippingAddress || null,
        products: (order.products || []).map((line: any) => ({
            name: line.name,
            size: line.size,
            qty: line.qty,
            price: line.price,
        })),
        returnRequests: (order.returnRequests || []).map((entry: any) => ({
            name: entry.name,
            qty: entry.qty,
            reason: entry.reason,
            status: entry.status,
            requestedAt: entry.requestedAt,
        })),
    }));
};

const historySection = async (userId: string) => {
    const user: any = await User.findById(userId)
        .select("recentlyViewed")
        .populate({ path: "recentlyViewed.product", model: Product, select: "name slug" })
        .lean();

    return (user?.recentlyViewed || []).map((entry: any) => ({
        product: entry.product?.name || "Product no longer in the catalogue",
        slug: entry.product?.slug || null,
        style: entry.style ?? null,
        viewedAt: entry.viewedAt || null,
    }));
};

const cartSection = async (userId: string) => {
    const cart: any = await Cart.findOne({ user: userId }).lean();

    if (!cart) {
        return null;
    }

    return {
        updatedAt: cart.updatedAt,
        cartTotal: cart.cartTotal,
        totalAfterDiscount: cart.totalAfterDiscount ?? null,
        products: (cart.products || []).map((line: any) => ({
            name: line.name,
            size: line.size,
            qty: line.qty,
            price: line.price,
        })),
    };
};

const listsSection = async (userId: string) => {
    const user: any = await User.findById(userId)
        .select("lists whishlist")
        .populate({ path: "lists.items.product", model: Product, select: "name slug" })
        .populate({ path: "whishlist.product", model: Product, select: "name slug" })
        .lean();

    return {
        lists: (user?.lists || []).map((list: any) => ({
            name: list.name,
            privacy: list.privacy,
            createdAt: list.createdAt,
            items: (list.items || [])
                .filter((item: any) => item.product)
                .map((item: any) => ({ product: item.product.name, slug: item.product.slug })),
        })),
        savedItems: (user?.whishlist || [])
            .filter((entry: any) => entry.product)
            .map((entry: any) => ({ product: entry.product.name, slug: entry.product.slug })),
    };
};

// GET /api/user/data?category=account|orders|history|all
// Returns the signed-in user's own records as a JSON download. It never reads
// another account: every query is scoped by the session id.
export const GET = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const category = new URL(req.url).searchParams.get("category") || "all";

        if (!categories.includes(category)) {
            return NextResponse.json(
                { message: `Unknown category. Choose one of: ${categories.join(", ")}.` },
                { status: 400 }
            );
        }

        await connectDb();

        const account = await accountSection(session.user.id);

        if (!account) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const payload: any = {
            requestedAt: new Date().toISOString(),
            category,
            account: { id: account.id, email: account.email },
        };

        if (category === "account" || category === "all") {
            payload.account = account;
        }

        if (category === "orders" || category === "all") {
            payload.orders = await ordersSection(session.user.id);
        }

        if (category === "history" || category === "all") {
            payload.browsingHistory = await historySection(session.user.id);
        }

        if (category === "all") {
            payload.cart = await cartSection(session.user.id);
            payload.lists = await listsSection(session.user.id);
        }

        const filename = `markaz-data-${category}-${new Date().toISOString().slice(0, 10)}.json`;

        return new NextResponse(JSON.stringify(JSON.parse(JSON.stringify(payload)), null, 4), {
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Cache-Control": "no-store",
            },
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
