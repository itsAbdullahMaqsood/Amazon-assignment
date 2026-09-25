import connectDb from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { toCardProduct } from "@/lib/recommendations";
import { applyDiscount } from "@/lib/price";
import { findVariant } from "@/lib/stock";

export const grocerySlug = (value: string) =>
    String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

const detail = (product: any, name: string) =>
    (product.details || []).find((entry: any) => entry.name === name)?.value || "";

// Aisle order as a shopper walks a shop, fresh first. Anything the seeder adds
// outside this list lands after it, alphabetically.
const AISLE_ORDER = [
    "Produce",
    "Dairy & Eggs",
    "Meat & Seafood",
    "Breads & Bakery",
    "Frozen",
    "Deli & Prepared",
    "Beverages",
    "Snacks",
    "Pantry",
    "Breakfast Foods",
    "Household",
];

const rank = (name: string) => {
    const index = AISLE_ORDER.indexOf(name);

    return index === -1 ? AISLE_ORDER.length : index;
};

// The last time this account bought each grocery product, so the page can open
// on the things that run out. Only paid orders count.
const getRestock = async (userId: string, categoryId: any) => {
    const orders: any[] = await Order.find({ user: userId, isPaid: true, status: { $ne: "Cancelled" } })
        .select("products createdAt paidAt")
        .sort({ createdAt: -1 })
        .lean();

    const lines = new Map<string, any>();

    for (const order of orders) {
        for (const line of order.products || []) {
            const key = `${line.product}-${line.size}`;

            if (!lines.has(key)) {
                lines.set(key, { line, at: order.paidAt || order.createdAt });
            }
        }
    }

    const ids = [...new Set([...lines.values()].map((entry) => String(entry.line.product)))];
    const products: any[] = ids.length
        ? await Product.find({ _id: { $in: ids }, category: categoryId }).select("name slug category subProducts").lean()
        : [];
    const byId = new Map(products.map((product) => [String(product._id), product]));

    return [...lines.values()]
        .filter((entry) => byId.has(String(entry.line.product)))
        .map((entry) => {
            const product = byId.get(String(entry.line.product));
            const variant = findVariant(product, entry.line);
            const style = variant ? product.subProducts.indexOf(variant) : -1;
            const sizeIndex = variant ? variant.sizes.findIndex((row: any) => row.size === entry.line.size) : -1;
            const row = sizeIndex >= 0 ? variant.sizes[sizeIndex] : null;

            return {
                key: `${product._id}-${entry.line.size}`,
                productId: String(product._id),
                name: product.name,
                slug: product.slug,
                image: entry.line.image,
                size: entry.line.size,
                lastAt: entry.at,
                price: row ? applyDiscount(row.price, variant.discount || 0) : null,
                listPrice: row && (variant.discount || 0) > 0 ? row.price : null,
                inStock: Boolean(row && row.qty > 0),
                rebuy: row && row.qty > 0 ? { productId: String(product._id), style, size: sizeIndex } : null,
            };
        })
        .slice(0, 6);
};

// The whole storefront in one read: the aisles with their counts, and the
// products in the aisle being looked at.
export const getGrocery = async (userId: string, { aisle = "", deals = false } = {}) => {
    await connectDb();

    const category: any = await Category.findOne({ slug: "grocery" }).select("_id").lean();

    if (!category) {
        return null;
    }

    const [products, restock]: any[] = await Promise.all([
        Product.find({ category: category._id }).sort({ "subProducts.sold": -1, rating: -1 }).lean(),
        userId ? getRestock(userId, category._id) : Promise.resolve([]),
    ]);

    const cards = products.map((product: any) => ({
        ...toCardProduct(product),
        // The pack the price belongs to, e.g. "3 lb bag".
        unit: product.subProducts?.[0]?.sizes?.[0]?.size || "",
        aisle: detail(product, "Department"),
    }));

    const aisles: any[] = [];

    for (const card of cards) {
        if (!card.aisle) continue;

        const found = aisles.find((entry) => entry.name === card.aisle);

        if (found) {
            found.count += 1;
        } else {
            aisles.push({ name: card.aisle, slug: grocerySlug(card.aisle), count: 1 });
        }
    }

    aisles.sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name));

    const current = aisles.find((entry) => entry.slug === aisle) || null;
    const shown = cards
        .filter((card: any) => (current ? card.aisle === current.name : true))
        .filter((card: any) => (deals ? card.discount > 0 : true));

    return JSON.parse(
        JSON.stringify({
            aisles,
            aisle: current,
            deals,
            dealCount: cards.filter((card: any) => card.discount > 0).length,
            products: shown,
            total: cards.length,
            restock,
        })
    );
};
