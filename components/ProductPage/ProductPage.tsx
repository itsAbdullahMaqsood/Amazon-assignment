"use client";

import { useState } from "react";

import Price from "@/components/ui/Price";
import Button from "@/components/ui/Button";
import { Breadcrumbs, Container, SectionHeader } from "@/components/ui/Layout";
import ProductRail from "@/components/landing/ProductRail";
import useAddToCart from "@/components/cart/useAddToCart";
import Gallery from "./Gallery";
import BuyPanel from "./BuyPanel";
import AskShabana from "./AskShabana";
import Reviews from "./reviews/Reviews";

// Reading order: gallery and the decision panel, then Shabana for questions,
// then what the product is, then what buyers said, then one row of
// alternatives at the very end, where it can't push reviews out of reach.
const ProductPage = ({ product, similar, saved, delivery }: any) => {
    const [preview, setPreview] = useState("");
    const { add, isPending } = useAddToCart();
    const sub = product.subCategories?.[0];

    const crumbs = [
        { label: "Home", href: "/" },
        ...(product.category ? [{ label: product.category.name, href: product.category.href }] : []),
        ...(sub && product.category ? [{ label: sub.name, href: `/browse?category=${product.category.slug}&sub=${sub.slug}` }] : []),
        { label: product.name },
    ];

    return (
        <main className="pb-24 lg:pb-0">
            <Container className="pt-4 md:pt-6">
                <Breadcrumbs items={crumbs} className="hidden md:block" />

                <div className="mt-0 grid gap-6 md:mt-5 md:grid-cols-[1.1fr_1fr] md:gap-10 lg:gap-14">
                    <Gallery images={product.images} name={product.name} preview={preview} />

                    <div className="md:sticky md:top-6 md:self-start">
                        <BuyPanel product={product} saved={saved} delivery={delivery} onPreview={setPreview} />
                        <div className="mt-5">
                            <AskShabana product={product} />
                        </div>
                    </div>
                </div>

                <section aria-labelledby="about" className="mt-14 grid gap-8 border-t border-line pt-10 md:grid-cols-[1fr_1fr] lg:gap-14">
                    <div>
                        <SectionHeader title="About this product" as="h2" />
                        <p id="about" className="max-w-prose leading-relaxed text-fg-muted">
                            {product.description}
                        </p>
                    </div>
                    {product.details?.length > 0 && (
                        <div>
                            <SectionHeader title="Specifications" as="h2" />
                            <dl className="divide-y divide-line rounded-card border border-line bg-surface text-sm">
                                {product.details.map((detail: any) => (
                                    <div key={detail.name} className="grid grid-cols-[9rem_1fr] gap-4 px-4 py-2.5">
                                        <dt className="text-fg-muted">{detail.name}</dt>
                                        <dd className="text-fg">{detail.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    )}
                </section>

                <Reviews product={product} />

                {similar.length > 0 && (
                    <div className="mt-14 border-t border-line pt-10">
                        <ProductRail
                            title={`More in ${sub?.name || product.category?.name || "this department"}`}
                            href={sub && product.category ? `/browse?category=${product.category.slug}&sub=${sub.slug}` : product.category?.href}
                            products={similar}
                        />
                    </div>
                )}
            </Container>

            {/* Phones: the price and the button stay in reach while reading. */}
            <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur md:hidden">
                <div className="min-w-0 flex-1">
                    <Price value={product.price} listPrice={product.priceBefore} size="md" showSaving={false} />
                    <p className="truncate text-xs text-fg-muted">
                        {product.quantity < 1 ? "Out of stock" : product.shipping > 0 ? `+$${Number(product.shipping).toFixed(2)} delivery` : "Free delivery"}
                    </p>
                </div>
                <Button
                    onClick={() => add({ productId: product._id, style: product.style, size: product.size })}
                    loading={isPending(product._id)}
                    disabled={product.quantity < 1}
                >
                    Add to cart
                </Button>
            </div>
        </main>
    );
};

export default ProductPage;
