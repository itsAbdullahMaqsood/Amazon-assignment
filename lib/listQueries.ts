import mongoose from "mongoose";

import connectDb from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import { applyDiscount } from "@/lib/price";
import { escapeRegex } from "@/utils/regex";
import { toList } from "@/lib/lists";

// One saved line, priced from the catalogue as it is now and from the variant
// that was saved.
const toItem = (entry: any, product: any, buyerName: string) => {
    const style = Number(entry.style) || 0;
    const variant = product.subProducts?.[style] || product.subProducts?.[0] || {};
    const sizes = variant.sizes || [];
    const discount = variant.discount || 0;
    const cheapest = sizes.reduce((best: any, size: any) => (!best || size.price < best.price ? size : best), null);

    return {
        _id: String(entry._id),
        productId: String(product._id),
        style,
        name: product.name,
        slug: product.slug,
        image: variant.images?.[0]?.url || "",
        rating: product.rating || 0,
        numberReviews: product.numberReviews || 0,
        price: cheapest ? applyDiscount(cheapest.price, discount) : 0,
        listPrice: discount > 0 ? cheapest?.price || null : null,
        inStock: sizes.some((size: any) => size.qty > 0),
        hasOptions: sizes.length > 1,
        addedAt: entry.addedAt || null,
        purchasedAt: entry.purchasedAt || null,
        purchasedBy: entry.purchasedBy ? String(entry.purchasedBy) : "",
        buyerName,
    };
};

const PRODUCT_FIELDS = "name slug rating numberReviews subProducts";

// The products a set of lists points at, fetched once for all of them.
const loadProducts = async (lists: any[]) => {
    const ids = [...new Set(lists.flatMap((list) => (list.items || []).map((item: any) => String(item.product))))];
    const products: any[] = ids.length ? await Product.find({ _id: { $in: ids } }).select(PRODUCT_FIELDS).lean() : [];

    return new Map(products.map((product) => [String(product._id), product]));
};

// Your lists, each with the first few thumbnails so a card shows what is in it
// rather than only how many things are.
export const getLists = async (userId: string) => {
    await connectDb();

    const user: any = await User.findById(userId).select("lists").lean();
    const lists = user?.lists || [];
    const byId = await loadProducts(lists);

    return JSON.parse(
        JSON.stringify(
            lists
                .map((list: any) => ({
                    ...toList(list),
                    thumbnails: (list.items || [])
                        .map((item: any) => byId.get(String(item.product)))
                        .filter(Boolean)
                        .slice(0, 4)
                        .map((product: any) => product.subProducts?.[0]?.images?.[0]?.url || ""),
                }))
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        )
    );
};

const buyerNames = async (list: any) => {
    const ids = [...new Set((list.items || []).map((item: any) => item.purchasedBy).filter(Boolean).map(String))];
    const buyers: any[] = ids.length ? await User.find({ _id: { $in: ids } }).select("name").lean() : [];

    return new Map(buyers.map((buyer) => [String(buyer._id), String(buyer.name || "").split(" ")[0]]));
};

const withItems = async (owner: any, list: any) => {
    const byId = await loadProducts([list]);
    const names = await buyerNames(list);

    return JSON.parse(
        JSON.stringify({
            ...toList(list),
            owner: owner.name || "A Markaz customer",
            ownerId: String(owner._id),
            items: (list.items || [])
                .filter((item: any) => byId.get(String(item.product)))
                .map((item: any) => toItem(item, byId.get(String(item.product)), names.get(String(item.purchasedBy)) || ""))
                .sort((a: any, b: any) => new Date(b.addedAt || 0).getTime() - new Date(a.addedAt || 0).getTime()),
        })
    );
};

// One of your own lists, whatever its privacy.
export const getOwnList = async (userId: string, listId: string) => {
    if (!mongoose.isValidObjectId(listId)) return null;

    await connectDb();

    const user: any = await User.findById(userId).select("name lists").lean();
    const list = (user?.lists || []).find((entry: any) => String(entry._id) === String(listId));

    return list ? withItems(user, list) : null;
};

// A list someone else can open. Private lists are not served here at all; a
// shared one is reachable by whoever has the link, a public one by search too.
export const getSharedList = async (listId: string) => {
    if (!mongoose.isValidObjectId(listId)) return null;

    await connectDb();

    const owner: any = await User.findOne({ "lists._id": listId }).select("name lists").lean();
    const list = (owner?.lists || []).find((entry: any) => String(entry._id) === String(listId));

    if (!list || list.privacy === "private") return null;

    return withItems(owner, list);
};

// Search is over public lists only, by the owner's name or the list's own name.
export const searchLists = async (term: string, limit = 40) => {
    const trimmed = String(term || "").trim();

    if (!trimmed) return [];

    await connectDb();

    const pattern = new RegExp(escapeRegex(trimmed), "i");
    const users: any[] = await User.find({
        "lists.privacy": "public",
        $or: [{ name: pattern }, { "lists.name": pattern }],
    })
        .select("name lists")
        .limit(limit)
        .lean();

    const results = users.flatMap((user: any) =>
        (user.lists || [])
            .filter((list: any) => list.privacy === "public" && (pattern.test(list.name || "") || pattern.test(user.name || "")))
            .map((list: any) => ({ ...toList(list), owner: user.name || "A Markaz customer" }))
    );

    return JSON.parse(JSON.stringify(results.slice(0, limit)));
};
