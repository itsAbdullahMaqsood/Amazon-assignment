import connectDb from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { escapeRegex } from "@/utils/regex";
import { rangeClause } from "@/lib/orders";
import { lineReturnInfo } from "@/lib/returns";
import { findVariant } from "@/lib/stock";

// The order tabs and what each one asks of the database.
export const orderTabs = [
    { value: "", label: "All" },
    { value: "active", label: "In progress", clause: { status: { $in: ["Not Processed", "Processing", "Dispatched"] } } },
    { value: "delivered", label: "Delivered", clause: { status: "Completed" } },
    { value: "cancelled", label: "Cancelled", clause: { status: "Cancelled" } },
];

// What a shopper calls each status.
export const statusLabel = (order: any) => {
    if (order.status === "Cancelled") return { label: "Cancelled", tone: "neutral" };
    if (order.status === "Completed") return { label: "Delivered", tone: "success" };
    if (order.status === "Dispatched") return { label: "On its way", tone: "accent" };
    if (!order.isPaid && order.paymentMethod === "cash") return { label: "Pay on delivery", tone: "warning" };
    if (!order.isPaid) return { label: "Awaiting payment", tone: "warning" };
    return { label: "Preparing", tone: "accent" };
};

// Adds to each line what the pages need and the order does not store: the
// product's current slug, the variant/size to add it to the cart again, and
// its return window from the product's own policy.
const enrichLines = (order: any, products: Map<string, any>) =>
    (order.products || []).map((line: any, index: number) => {
        const product = products.get(String(line.product));
        const variant = product ? findVariant(product, line) : null;
        const style = variant ? product.subProducts.indexOf(variant) : -1;
        const size = variant ? variant.sizes.findIndex((entry: any) => entry.size === line.size) : -1;

        return {
            ...line,
            index,
            slug: product?.slug || "",
            rebuy: product && style >= 0 && size >= 0 && variant.sizes[size].qty > 0 ? { productId: String(product._id), style, size } : null,
            returns: lineReturnInfo(order, index, product?.refundPolicy),
            requests: (order.returnRequests || []).filter((request: any) => Number(request.line) === index),
        };
    });

const loadProducts = async (orders: any[]) => {
    const ids = [...new Set(orders.flatMap((order) => (order.products || []).map((line: any) => String(line.product))))];
    const products: any[] = ids.length
        ? await Product.find({ _id: { $in: ids } }).select("slug refundPolicy subProducts").lean()
        : [];

    return new Map(products.map((product) => [String(product._id), product]));
};

export const getOrders = async (userId: string, { tab = "", time = "", search = "" }: any) => {
    await connectDb();

    const base: any = { user: userId, ...(time && { createdAt: rangeClause(time) }) };

    if (search) {
        base["products.name"] = { $regex: escapeRegex(search), $options: "i" };
    }

    const current = orderTabs.find((entry) => entry.value === tab) || orderTabs[0];

    const [orders, counts, returnsCount] = await Promise.all([
        Order.find({ ...base, ...(current.clause || {}) })
            .sort({ createdAt: -1 })
            .lean(),
        Promise.all(orderTabs.map((entry) => Order.countDocuments({ ...base, ...(entry.clause || {}) }))),
        Order.countDocuments({ user: userId, "returnRequests.0": { $exists: true } }),
    ]);

    const products = await loadProducts(orders as any[]);

    return JSON.parse(
        JSON.stringify({
            orders: (orders as any[]).map((order) => ({ ...order, lines: enrichLines(order, products), state: statusLabel(order) })),
            tabs: orderTabs.map((entry, i) => ({ value: entry.value, label: entry.label, count: counts[i] })),
            returnsCount,
        })
    );
};

export const getOrderDetail = async (orderId: string, userId: string, role: string) => {
    await connectDb();

    let order: any = null;

    try {
        order = await Order.findById(orderId).lean();
    } catch {
        return null;
    }

    // An order id is not a capability: only the owner or an admin may read it.
    if (!order || (String(order.user) !== String(userId) && role !== "admin")) {
        return null;
    }

    const products = await loadProducts([order]);

    return JSON.parse(JSON.stringify({ ...order, lines: enrichLines(order, products), state: statusLabel(order) }));
};

// Every return request across the shopper's orders, newest first, plus the
// lines that can still be sent back.
export const getReturns = async (userId: string) => {
    await connectDb();

    const orders: any[] = await Order.find({ user: userId, status: { $ne: "Cancelled" } }).sort({ createdAt: -1 }).lean();
    const products = await loadProducts(orders);

    const requests = orders
        .flatMap((order) => (order.returnRequests || []).map((request: any) => ({ ...request, orderId: String(order._id) })))
        .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

    const returnable = orders
        .map((order) => ({ ...order, lines: enrichLines(order, products).filter((line: any) => line.returns.returnable) }))
        .filter((order) => order.lines.length);

    return JSON.parse(JSON.stringify({ requests, returnable }));
};
