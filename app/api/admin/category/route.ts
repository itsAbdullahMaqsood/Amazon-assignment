import { NextResponse } from "next/server";

import connectDb from "@/lib/db";
import { requireAdmin } from "@/lib/guard";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Product from "@/models/Product";
import {
    checkName,
    findClash,
    inUseMessage,
    isDuplicateKey,
    isId,
    listCategories,
} from "@/components/admin/catalog/queries";

const bad = (message: string, status = 400) => NextResponse.json({ message }, { status });

const readBody = async (req: Request) => {
    try {
        return (await req.json()) || {};
    } catch {
        return {};
    }
};

const clashMessage = (name: string) => `A category called "${name}" already exists.`;

// POST { name } -> { message, category, categories }
export const POST = async (req: Request) => {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const body = await readBody(req);
        const checked = checkName(body.name, "category");
        if (checked.error) return bad(checked.error);

        await connectDb();

        const clash: any = await findClash(Category, checked.name, checked.slug);
        if (clash) return bad(clashMessage(clash.name));

        const category = await Category.create({ name: checked.name, slug: checked.slug });

        return NextResponse.json({
            message: `Category "${category.name}" created.`,
            category,
            categories: await listCategories(),
        });
    } catch (err: any) {
        // Two admins racing on the same name get past findClash; the unique index catches it.
        if (isDuplicateKey(err)) return bad("A category with that name already exists.");
        return bad(err.message, 500);
    }
};

// PUT { id, name } -> renames and regenerates the slug.
export const PUT = async (req: Request) => {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const body = await readBody(req);
        if (!isId(body.id)) return bad("Category not found.", 404);

        const checked = checkName(body.name, "category");
        if (checked.error) return bad(checked.error);

        await connectDb();

        const category: any = await Category.findById(body.id);
        if (!category) return bad("Category not found.", 404);

        const clash: any = await findClash(Category, checked.name, checked.slug, body.id);
        if (clash) return bad(clashMessage(clash.name));

        category.name = checked.name;
        category.slug = checked.slug;
        await category.save();

        return NextResponse.json({
            message: `Category renamed to "${category.name}".`,
            category,
            categories: await listCategories(),
        });
    } catch (err: any) {
        if (isDuplicateKey(err)) return bad("A category with that name already exists.");
        return bad(err.message, 500);
    }
};

// DELETE { id } -> refused while sub-categories or products still point at it.
export const DELETE = async (req: Request) => {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const body = await readBody(req);
        if (!isId(body.id)) return bad("Category not found.", 404);

        await connectDb();

        const category: any = await Category.findById(body.id).select("name").lean();
        if (!category) return bad("Category not found.", 404);

        const [subCount, productCount] = await Promise.all([
            SubCategory.countDocuments({ parent: body.id }),
            Product.countDocuments({ category: body.id }),
        ]);

        if (subCount || productCount) {
            return bad(
                inUseMessage(
                    category.name,
                    [
                        { count: subCount, word: "sub-category" },
                        { count: productCount, word: "product" },
                    ],
                    subCount + productCount === 1 ? "Move or delete it first." : "Move or delete them first."
                ),
                409
            );
        }

        await Category.deleteOne({ _id: body.id });

        return NextResponse.json({
            message: `Category "${category.name}" deleted.`,
            categories: await listCategories(),
        });
    } catch (err: any) {
        return bad(err.message, 500);
    }
};
