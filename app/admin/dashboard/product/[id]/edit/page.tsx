import Link from "next/link";
import { notFound } from "next/navigation";

import connectDb from "@/lib/db";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Product from "@/models/Product";
import { requireAdminPage } from "@/lib/guard";
import { PageHeader } from "@/components/admin/ui";
import ProductForm from "@/components/admin/product/ProductForm";

export const metadata = { title: "Edit product" };

const Page = async ({ params, searchParams }: any) => {
    const { id } = await params;
    const query = await searchParams;

    await requireAdminPage(`/admin/dashboard/product/${id}/edit`);
    await connectDb();

    const product: any = await Product.findById(id).lean().catch(() => null);

    if (!product) {
        notFound();
    }

    const style = Math.min(Math.max(Number(query?.style) || 0, 0), product.subProducts.length - 1);
    const variant = product.subProducts[style];

    const [categories, subCategories] = await Promise.all([
        Category.find().sort({ name: 1 }).lean(),
        SubCategory.find().sort({ name: 1 }).lean(),
    ]);

    const initial = JSON.parse(
        JSON.stringify({
            productId: product._id,
            slug: product.slug,
            style,
            variantCount: product.subProducts.length,
            shared: {
                name: product.name,
                description: product.description,
                brand: product.brand || "",
                category: String(product.category),
                subCategories: (product.subCategories || []).map(String),
                shipping: product.shipping ?? 0,
                details: product.details || [],
                questions: product.questions || [],
            },
            variant: {
                sku: variant.sku,
                discount: variant.discount,
                color: variant.color,
                images: variant.images,
                description_images: variant.description_images,
                sizes: (variant.sizes || []).map((row: any) => ({
                    size: row.size,
                    qty: String(row.qty),
                    price: String(row.price),
                })),
            },
        })
    );

    return (
        <>
            <PageHeader
                title={`Edit ${product.name}`}
                description="Changes to the name, category and details apply to every colour."
                actions={
                    product.subProducts.length > 1 && (
                        <nav aria-label="Colour variants" className="flex flex-wrap gap-2">
                            {product.subProducts.map((sub: any, i: number) => (
                                <Link
                                    key={i}
                                    href={`/admin/dashboard/product/${id}/edit?style=${i}`}
                                    aria-current={i === style ? "page" : undefined}
                                    className={`inline-flex items-center gap-2 h-10 px-3 rounded-lg border text-sm ${
                                        i === style ? "border-accent-ink bg-sky-50" : "border-slate-300 bg-white"
                                    }`}
                                >
                                    <span
                                        aria-hidden="true"
                                        className="w-4 h-4 rounded-full border border-slate-300"
                                        style={{ backgroundColor: sub.color?.color }}
                                    />
                                    Colour {i + 1}
                                </Link>
                            ))}
                        </nav>
                    )
                }
            />
            {/* Keyed by variant so switching colour remounts the form with its own values. */}
            <ProductForm
                key={style}
                mode="edit"
                categories={JSON.parse(JSON.stringify(categories))}
                subCategories={JSON.parse(JSON.stringify(subCategories))}
                initial={initial}
            />
        </>
    );
};

export default Page;
