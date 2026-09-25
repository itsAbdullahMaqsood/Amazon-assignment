import connectDb from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Category from "@/models/Category";
import User from "@/models/User";
import { applyDiscount } from "@/lib/price";
import { findVariant } from "@/lib/stock";
import { escapeRegex } from "@/utils/regex";

// One thing you have bought, in the option you bought it in, priced as the
// catalogue prices it now. `rebuy` is what the cart needs to put it back; it is
// null when the product, the colour or the size has gone, and the card then says
// so instead of offering a button that fails.
const toPurchase = (line: any, product: any, times: number, lastAt: any) => {
    const variant = product ? findVariant(product, line) : null;
    const style = variant ? product.subProducts.indexOf(variant) : -1;
    const sizeIndex = variant ? variant.sizes.findIndex((entry: any) => entry.size === line.size) : -1;
    const row = sizeIndex >= 0 ? variant.sizes[sizeIndex] : null;
    const discount = variant?.discount || 0;

    return {
        key: `${line.product}-${line.image}-${line.size}`,
        productId: String(line.product),
        name: product?.name || line.name,
        slug: product?.slug || "",
        image: line.image,
        size: line.size,
        times,
        lastAt,
        paidPrice: line.price,
        price: row ? applyDiscount(row.price, discount) : null,
        listPrice: row && discount > 0 ? row.price : null,
        inStock: Boolean(row && row.qty > 0),
        category: product ? String(product.category) : "",
        rebuy: row && row.qty > 0 ? { productId: String(product._id), style, size: sizeIndex } : null,
    };
};

// Everything the shopper has paid for, newest purchase first, one entry per
// product-and-option rather than one per order line.
export const getBuyAgain = async (userId: string, { search = "" } = {}) => {
    await connectDb();

    const orders: any[] = await Order.find({ user: userId, isPaid: true, status: { $ne: "Cancelled" } })
        .select("products createdAt paidAt")
        .sort({ createdAt: -1 })
        .lean();

    const grouped = new Map<string, { line: any; times: number; lastAt: any }>();

    for (const order of orders) {
        for (const line of order.products || []) {
            const key = `${line.product}-${line.image}-${line.size}`;
            const seen = grouped.get(key);
            const at = order.paidAt || order.createdAt;

            if (seen) {
                seen.times += line.qty || 1;
                seen.lastAt = new Date(seen.lastAt) > new Date(at) ? seen.lastAt : at;
            } else {
                grouped.set(key, { line, times: line.qty || 1, lastAt: at });
            }
        }
    }

    const ids = [...new Set([...grouped.values()].map((entry) => String(entry.line.product)))];
    const [products, categories]: any[] = await Promise.all([
        ids.length ? Product.find({ _id: { $in: ids } }).select("name slug category subProducts").lean() : [],
        Category.find().select("name slug").lean(),
    ]);

    const byId = new Map(products.map((product: any) => [String(product._id), product]));
    const pattern = search ? new RegExp(escapeRegex(search), "i") : null;

    const items = [...grouped.values()]
        .map((entry) => toPurchase(entry.line, byId.get(String(entry.line.product)), entry.times, entry.lastAt))
        .filter((item) => !pattern || pattern.test(item.name))
        .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());

    // Grouped by department, in the order the departments last appeared in your
    // orders, so the thing you bought most recently leads the page.
    const groups: any[] = [];

    for (const item of items) {
        const category: any = categories.find((entry: any) => String(entry._id) === item.category);
        const name = category?.name || "Other";
        const slug = category?.slug || "";
        const group = groups.find((entry) => entry.name === name);

        if (group) {
            group.items.push(item);
        } else {
            groups.push({ name, slug, items: [item] });
        }
    }

    return JSON.parse(JSON.stringify({ groups, total: items.length }));
};

// The products this account has actually looked at, newest first, priced now.
export const getViewed = async (userId: string) => {
    await connectDb();

    const user: any = await User.findById(userId)
        .select("recentlyViewed")
        .populate({
            path: "recentlyViewed.product",
            model: Product,
            select: "name slug brand rating numberReviews shipping subProducts",
        })
        .lean();

    const items = (user?.recentlyViewed || [])
        .filter((entry: any) => entry.product)
        .map((entry: any) => {
            const style = Number(entry.style) || 0;
            const variant = entry.product.subProducts?.[style] || entry.product.subProducts?.[0] || {};
            const sizes = variant.sizes || [];
            const discount = variant.discount || 0;
            const cheapest = sizes.reduce((best: any, size: any) => (!best || size.price < best.price ? size : best), null);

            return {
                key: `${entry.product._id}-${style}`,
                productId: String(entry.product._id),
                style,
                name: entry.product.name,
                slug: entry.product.slug,
                image: variant.images?.[0]?.url || "",
                rating: entry.product.rating || 0,
                numberReviews: entry.product.numberReviews || 0,
                price: cheapest ? applyDiscount(cheapest.price, discount) : 0,
                listPrice: discount > 0 ? cheapest?.price || null : null,
                inStock: sizes.some((size: any) => size.qty > 0),
                hasOptions: sizes.length > 1 || (entry.product.subProducts || []).length > 1,
                viewedAt: entry.viewedAt || null,
            };
        });

    return JSON.parse(JSON.stringify(items));
};
