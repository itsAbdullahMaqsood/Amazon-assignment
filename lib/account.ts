import connectDb from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { statusLabel } from "@/lib/orderQueries";
import { toCardProduct } from "@/lib/recommendations";
import { applyDiscount } from "@/lib/price";

const SELECT =
    "name email image createdAt password address defaultPaymentMethod giftCardBalance whishlist lists recentlyViewed";

// The shape the overview renders: one read of the user document, the newest
// order, and two counts. Nothing here is stored twice — every number is counted
// from what the account actually holds.
export const getAccountOverview = async (userId: string) => {
    await connectDb();

    const [user, latest, orderCount, returnsCount]: any[] = await Promise.all([
        User.findById(userId)
            .select(SELECT)
            .populate({
                path: "recentlyViewed.product",
                model: Product,
                select: "name slug brand rating numberReviews subProducts shipping",
            })
            .lean(),
        Order.findOne({ user: userId })
            .sort({ createdAt: -1 })
            .select("products total status isPaid paymentMethod createdAt paidAt deliveredAt")
            .lean(),
        Order.countDocuments({ user: userId }),
        Order.countDocuments({ user: userId, "returnRequests.0": { $exists: true } }),
    ]);

    if (!user) {
        return null;
    }

    const addresses = user.address || [];
    const viewed = (user.recentlyViewed || []).filter((entry: any) => entry.product);

    return JSON.parse(
        JSON.stringify({
            name: user.name || "",
            email: user.email || "",
            memberSince: user.createdAt || null,
            addressCount: addresses.length,
            defaultAddress: addresses.find((entry: any) => entry.active) || addresses[0] || null,
            paymentMethod: user.defaultPaymentMethod || "",
            giftCardBalance: user.giftCardBalance || 0,
            savedCount: (user.whishlist || []).length,
            listCount: (user.lists || []).length,
            orderCount,
            returnsCount,
            latestOrder: latest
                ? {
                      _id: String(latest._id),
                      state: statusLabel(latest),
                      total: latest.total,
                      createdAt: latest.createdAt,
                      paymentMethod: latest.paymentMethod,
                      itemCount: (latest.products || []).reduce((sum: number, line: any) => sum + (line.qty || 0), 0),
                      lines: (latest.products || []).slice(0, 4).map((line: any) => ({ name: line.name, image: line.image })),
                  }
                : null,
            // Cards, so the row reads exactly as it does everywhere else in the store.
            recentlyViewed: viewed.slice(0, 5).map((entry: any) => toCardProduct(entry.product)),
        })
    );
};

// One saved line, priced from the product as it is now rather than from what it
// cost when it was saved. The variant is the one that was saved; if it has gone,
// the first one stands in so the row still leads somewhere.
export const toSavedItem = (entry: any) => {
    const product = entry.product;
    const index = Number(entry.style) || 0;
    const variant = product.subProducts?.[index] || product.subProducts?.[0] || {};
    const sizes = variant.sizes || [];
    const discount = variant.discount || 0;
    const cheapest = sizes.reduce(
        (best: any, size: any) => (!best || size.price < best.price ? size : best),
        null
    );
    const qty = sizes.reduce((total: number, size: any) => total + (size.qty || 0), 0);

    return {
        key: `${product._id}-${entry.style}`,
        productId: String(product._id),
        style: String(entry.style ?? 0),
        name: product.name,
        slug: product.slug,
        image: variant.images?.[0]?.url || "",
        rating: product.rating || 0,
        numberReviews: product.numberReviews || 0,
        price: applyDiscount(cheapest?.price || 0, discount),
        listPrice: discount > 0 ? cheapest?.price || 0 : null,
        discount,
        inStock: qty > 0,
        // More than one size means picking for the shopper would be a guess.
        hasOptions: sizes.length > 1,
        shipping: product.shipping || 0,
    };
};
