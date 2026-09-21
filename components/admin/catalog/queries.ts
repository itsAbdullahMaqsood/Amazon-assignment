import mongoose from "mongoose";
import slugify from "slugify";

import connectDb from "@/lib/db";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Product from "@/models/Product";
import { escapeRegex } from "@/utils/regex";

// Server-only: shared by the admin pages and the route handlers, so a mutation
// answers with exactly the list the page would have rendered.

export const toSlug = (name: string) => slugify(String(name), { lower: true, strict: true });

export const isId = (id: any) => typeof id === "string" && mongoose.isValidObjectId(id);

// Trimmed, inner whitespace collapsed, 2–32 chars, and something slugify can use.
export const checkName = (raw: any, noun: string) => {
    const name = String(raw ?? "").trim().replace(/\s+/g, " ");

    if (name.length < 2 || name.length > 32) {
        return { error: `A ${noun} name must be between 2 and 32 characters.` };
    }

    const slug = toSlug(name);

    if (!slug) {
        return { error: `A ${noun} name needs at least one letter or number.` };
    }

    return { name, slug };
};

// Case-insensitive name match as well as slug, so "shoes" cannot sit next to "Shoes".
export const findClash = async (Model: any, name: string, slug: string, exceptId?: string) => {
    const query: any = { $or: [{ slug }, { name: new RegExp(`^${escapeRegex(name)}$`, "i") }] };

    if (exceptId) {
        query._id = { $ne: exceptId };
    }

    return Model.findOne(query).select("name").lean();
};

export const isDuplicateKey = (error: any) => error?.code === 11000;

const plural = (count: number, word: string) =>
    `${count} ${count === 1 ? word : word.endsWith("y") ? `${word.slice(0, -1)}ies` : `${word}s`}`;

export const inUseMessage = (name: string, parts: { count: number; word: string }[], tail: string) => {
    const used = parts.filter((part) => part.count > 0).map((part) => plural(part.count, part.word));

    return `${name} still has ${used.join(" and ")}. ${tail}`;
};

const countBy = async (Model: any, pipeline: any[]) => {
    const rows = await Model.aggregate(pipeline);

    return new Map(rows.map((row: any) => [String(row._id), row.count]));
};

export const listCategories = async () => {
    await connectDb();

    const [categories, subs, products] = await Promise.all([
        Category.find().select("name slug createdAt").sort({ name: 1 }).lean(),
        countBy(SubCategory, [{ $group: { _id: "$parent", count: { $sum: 1 } } }]),
        countBy(Product, [{ $group: { _id: "$category", count: { $sum: 1 } } }]),
    ]);

    return JSON.parse(
        JSON.stringify(
            categories.map((category: any) => ({
                ...category,
                subCount: subs.get(String(category._id)) || 0,
                productCount: products.get(String(category._id)) || 0,
            }))
        )
    );
};

export const listSubCategories = async () => {
    await connectDb();

    const [subCategories, products] = await Promise.all([
        SubCategory.find().select("name slug parent createdAt").populate({ path: "parent", model: Category, select: "name" }).sort({ name: 1 }).lean(),
        countBy(Product, [
            { $unwind: "$subCategories" },
            { $group: { _id: "$subCategories", count: { $sum: 1 } } },
        ]),
    ]);

    return JSON.parse(
        JSON.stringify(
            subCategories.map((sub: any) => ({
                ...sub,
                productCount: products.get(String(sub._id)) || 0,
            }))
        )
    );
};

export const listCategoryOptions = async () => {
    await connectDb();

    const categories = await Category.find().select("name").sort({ name: 1 }).lean();

    return JSON.parse(JSON.stringify(categories));
};
