import slugify from "slugify";

import Product from "@/models/Product";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import { CLOUDINARY_ROOT } from "@/lib/cloudinary";
import { HEX, MAX_IMAGES, MIN_IMAGES, checkProduct, meaningful } from "@/lib/productForm";

const cloud = () => String(process.env.CLOUDINARY_NAME || "").trim();

// Product imagery must be something this app uploaded into its own products/
// folder — never an arbitrary URL typed into a request.
export const isOurProductImage = (image: any) =>
    String(image?.url || "").startsWith(`https://res.cloudinary.com/${cloud()}/image/upload/`) &&
    String(image?.public_url || "").startsWith(`${CLOUDINARY_ROOT}/products/`);

const cleanImages = (images: any) =>
    (Array.isArray(images) ? images : []).map((image: any) => ({
        url: String(image?.url || ""),
        public_url: String(image?.public_url || ""),
    }));

// Every Cloudinary asset a product owns, so deleting or editing it can clean up.
// Seeded products point at the dummyjson CDN and are skipped automatically.
export const ownedPublicIds = (product: any) =>
    [
        ...(product.subProducts || []).flatMap((sub: any) => [
            ...(sub.images || []),
            ...(sub.description_images || []),
        ]),
        ...(product.reviews || []).flatMap((review: any) => review.images || []),
    ]
        .map((image: any) => image?.public_url)
        .concat((product.subProducts || []).map((sub: any) => colorImageId(sub.color?.image)))
        .filter((id: any) => typeof id === "string" && id.startsWith(`${CLOUDINARY_ROOT}/`));

export const colorImageId = (url: string) => {
    // The swatch is stored as a bare URL (the schema's color.image is a string),
    // so its public id is recovered from the path.
    const match = String(url || "").match(new RegExp(`/(${CLOUDINARY_ROOT}/products/[^.]+)\\.[a-z]+$`, "i"));

    return match ? match[1] : "";
};

// Name → slug, de-duplicated with -2, -3 … against every other product.
export const uniqueSlug = async (name: string, excludeId?: any) => {
    const base = slugify(name, { lower: true, strict: true }) || "product";
    let slug = base;

    for (let n = 2; await Product.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) }); n++) {
        slug = `${base}-${n}`;
    }

    return slug;
};

// Validates a request body the same way the form did, then the parts only the
// server can check. Returns { errors } or the normalised { shared, variant }.
// `existing` is the variant being edited: images it already had may stay even
// when they are not ours (the seeded catalogue lives on the dummyjson CDN), but
// anything new must have come through this store's upload route.
export const parseProductBody = async (body: any, { variantMode, existing }: any) => {
    const kept = new Set<string>(
        [
            ...(existing?.images || []),
            ...(existing?.description_images || []),
            { url: existing?.color?.image },
        ].map((image: any) => String(image?.url || ""))
    );
    const allowed = (image: any) => kept.has(String(image?.url || "")) || isOurProductImage(image);

    const images = cleanImages(body.images);
    const descriptionImages = cleanImages(body.description_images);
    const color = { color: String(body.color?.color || ""), image: String(body.color?.image || "") };

    const results = checkProduct(
        {
            ...body,
            color: color.color,
            hasColorImage: Boolean(color.image),
            sizes: body.sizes,
        },
        { imageCount: images.length, variantMode }
    );

    const errors = results.filter((result) => result.type === "error").map((result) => result.msg);

    if (images.length > MAX_IMAGES || images.length < MIN_IMAGES || !images.every(allowed)) {
        errors.push("Product images must be uploaded through this store.");
    }

    if (!descriptionImages.every(allowed) || descriptionImages.length > MAX_IMAGES) {
        errors.push("Description images must be uploaded through this store.");
    }

    if (
        color.image &&
        !kept.has(color.image) &&
        (!color.image.startsWith(`https://res.cloudinary.com/${cloud()}/image/upload/`) ||
            !colorImageId(color.image))
    ) {
        errors.push("The style image must be uploaded through this store.");
    }

    if (!HEX.test(color.color)) {
        errors.push("Choose a main product color.");
    }

    const variant = {
        sku: String(body.sku || "").trim(),
        discount: Number(body.discount) || 0,
        color,
        images,
        description_images: descriptionImages,
        sizes: meaningful(body.sizes, ["size", "qty", "price"]).map((row: any) => ({
            size: String(row.size).trim(),
            qty: Number(row.qty),
            price: Number(Number(row.price).toFixed(2)),
        })),
    };

    if (variantMode) {
        return errors.length ? { errors: [...new Set(errors)] } : { variant };
    }

    const category: any = body.category ? await Category.findById(body.category).lean().catch(() => null) : null;

    if (body.category && !category) {
        errors.push("That category no longer exists.");
    }

    const subIds = [...new Set((Array.isArray(body.subCategories) ? body.subCategories : []).map(String))];
    const subs: any[] = subIds.length
        ? await SubCategory.find({ _id: { $in: subIds } }).lean().catch(() => [])
        : [];

    if (subs.length !== subIds.length || subs.some((sub) => String(sub.parent) !== String(category?._id))) {
        errors.push("Every sub-category must belong to the chosen category.");
    }

    if (errors.length) {
        return { errors: [...new Set(errors)] };
    }

    return {
        shared: {
            name: String(body.name).trim(),
            description: String(body.description).trim(),
            brand: String(body.brand).trim(),
            category: category._id,
            subCategories: subs.map((sub) => sub._id),
            shipping: Number(body.shipping),
            details: meaningful(body.details, ["name", "value"]).map((row: any) => ({
                name: String(row.name).trim(),
                value: String(row.value).trim(),
            })),
            questions: meaningful(body.questions, ["question", "answer"]).map((row: any) => ({
                question: String(row.question).trim(),
                answer: String(row.answer).trim(),
            })),
        },
        variant,
    };
};
