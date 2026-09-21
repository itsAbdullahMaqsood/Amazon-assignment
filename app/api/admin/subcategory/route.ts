import { NextResponse } from "next/server";

import connectDb from "@/lib/db";
import { requireAdmin } from "@/lib/guard";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Product from "@/models/Product";
import {
    checkName,
    findClash,
    isDuplicateKey,
    isId,
    listSubCategories,
} from "@/components/admin/catalog/queries";

const bad = (message: string, status = 400) => NextResponse.json({ message }, { status });

const readBody = async (req: Request) => {
    try {
        return (await req.json()) || {};
    } catch {
        return {};
    }
};

const clashMessage = (name: string) => `A sub-category called "${name}" already exists.`;

// Name and parent are validated together so create and edit share one rule set.
const checkInput = async (body: any) => {
    const checked = checkName(body.name, "sub-category");
    if (checked.error) return { error: checked.error };

    if (!body.parent) return { error: "Choose a parent category." };

    const parent = isId(body.parent) ? await Category.findById(body.parent).select("_id").lean() : null;
    if (!parent) return { error: "That parent category does not exist." };

    return { name: checked.name, slug: checked.slug, parent: body.parent };
};

// POST { name, parent } -> { message, subCategory, subCategories }
export const POST = async (req: Request) => {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const body = await readBody(req);

        await connectDb();

        const input: any = await checkInput(body);
        if (input.error) return bad(input.error);

        const clash: any = await findClash(SubCategory, input.name, input.slug);
        if (clash) return bad(clashMessage(clash.name));

        const subCategory = await SubCategory.create(input);

        return NextResponse.json({
            message: `Sub-category "${subCategory.name}" created.`,
            subCategory,
            subCategories: await listSubCategories(),
        });
    } catch (err: any) {
        if (isDuplicateKey(err)) return bad("A sub-category with that name already exists.");
        return bad(err.message, 500);
    }
};

// PUT { id, name, parent } -> renames (new slug) and/or moves it to another parent.
export const PUT = async (req: Request) => {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const body = await readBody(req);
        if (!isId(body.id)) return bad("Sub-category not found.", 404);

        await connectDb();

        const input: any = await checkInput(body);
        if (input.error) return bad(input.error);

        const subCategory: any = await SubCategory.findById(body.id);
        if (!subCategory) return bad("Sub-category not found.", 404);

        const clash: any = await findClash(SubCategory, input.name, input.slug, body.id);
        if (clash) return bad(clashMessage(clash.name));

        subCategory.name = input.name;
        subCategory.slug = input.slug;
        subCategory.parent = input.parent;
        await subCategory.save();

        return NextResponse.json({
            message: `Sub-category "${subCategory.name}" saved.`,
            subCategory,
            subCategories: await listSubCategories(),
        });
    } catch (err: any) {
        if (isDuplicateKey(err)) return bad("A sub-category with that name already exists.");
        return bad(err.message, 500);
    }
};

// DELETE { id } -> refused while any product lists it.
export const DELETE = async (req: Request) => {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const body = await readBody(req);
        if (!isId(body.id)) return bad("Sub-category not found.", 404);

        await connectDb();

        const subCategory: any = await SubCategory.findById(body.id).select("name").lean();
        if (!subCategory) return bad("Sub-category not found.", 404);

        const productCount = await Product.countDocuments({ subCategories: body.id });

        if (productCount) {
            return bad(
                `${subCategory.name} is still used by ${productCount} product${productCount === 1 ? "" : "s"}. Remove it from those products first.`,
                409
            );
        }

        await SubCategory.deleteOne({ _id: body.id });

        return NextResponse.json({
            message: `Sub-category "${subCategory.name}" deleted.`,
            subCategories: await listSubCategories(),
        });
    } catch (err: any) {
        return bad(err.message, 500);
    }
};
