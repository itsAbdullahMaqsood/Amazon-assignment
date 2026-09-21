import { NextResponse } from "next/server";

import connectDb from "@/lib/db";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/guard";
import { parseProductBody, uniqueSlug } from "@/lib/productAdmin";

// Creates a product, or — when `parent` is sent — adds a colour variant to an
// existing one. Everything the form checked is checked again here.
export const POST = async (req: Request) => {
    try {
        const { error } = await requireAdmin();

        if (error) {
            return error;
        }

        const body = await req.json();

        await connectDb();

        if (body.parent) {
            const parent: any = await Product.findById(body.parent).catch(() => null);

            if (!parent) {
                return NextResponse.json({ message: "That parent product no longer exists." }, { status: 404 });
            }

            const parsed: any = await parseProductBody(body, { variantMode: true });

            if (parsed.errors) {
                return NextResponse.json({ message: parsed.errors[0], messages: parsed.errors }, { status: 400 });
            }

            // A colour the product already comes in is almost always a mistake.
            if (parent.subProducts.some((sub: any) => sub.color?.color?.toLowerCase() === parsed.variant.color.color.toLowerCase())) {
                return NextResponse.json(
                    { message: "This product already has a variant in that colour." },
                    { status: 400 }
                );
            }

            parent.subProducts.push({ ...parsed.variant, sold: 0 });
            await parent.save();

            return NextResponse.json({
                message: `Added a new colour to "${parent.name}".`,
                product: { _id: parent._id, slug: parent.slug, style: parent.subProducts.length - 1 },
            });
        }

        const parsed: any = await parseProductBody(body, { variantMode: false });

        if (parsed.errors) {
            return NextResponse.json({ message: parsed.errors[0], messages: parsed.errors }, { status: 400 });
        }

        const product = await new Product({
            ...parsed.shared,
            slug: await uniqueSlug(parsed.shared.name),
            subProducts: [{ ...parsed.variant, sold: 0 }],
        }).save();

        return NextResponse.json({
            message: `"${product.name}" is live.`,
            product: { _id: product._id, slug: product.slug, style: 0 },
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
