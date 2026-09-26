"use client";

import Link from "next/link";
import Image from "next/image";

import { money } from "@/components/ui/Price";
import { SectionHeader } from "@/components/ui/Layout";
import useAddToCart from "@/components/cart/useAddToCart";

const since = (value: any) => {
    const days = Math.floor((Date.now() - new Date(value).getTime()) / 86400000);

    if (days <= 0) return "bought today";
    if (days === 1) return "bought yesterday";
    if (days < 30) return `bought ${days} days ago`;

    return `bought ${Math.round(days / 30)} month${Math.round(days / 30) === 1 ? "" : "s"} ago`;
};

// Groceries run out, so the first thing on the page is what you have bought
// before — the real reason anyone opens a grocery storefront twice.
const RestockRow = ({ items }: any) => {
    const { add, pending } = useAddToCart();

    if (!items.length) {
        return null;
    }

    return (
        <section className="mb-10">
            <SectionHeader
                title="Restock"
                description="Groceries you have bought before, at today's price."
                action={
                    <Link href="/buy-again" className="whitespace-nowrap text-link">
                        Everything you buy
                    </Link>
                }
            />

            <div className="scroll-row -mx-4 px-4 sm:mx-0 sm:px-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible lg:grid-cols-6">
                {items.map((item: any) => (
                    <article key={item.key} className="w-40 shrink-0 rounded-card border border-line bg-surface p-3 md:w-auto">
                        <Link href={`/product/${item.slug}`} aria-hidden="true" tabIndex={-1} className="relative block aspect-square overflow-hidden rounded-control bg-surface-muted">
                            {item.image && <Image src={item.image} alt="" fill sizes="160px" className="object-contain p-2" />}
                        </Link>

                        <Link href={`/product/${item.slug}`} className="mt-2 line-clamp-2 block text-sm font-medium text-fg hover:underline underline-offset-2">
                            {item.name}
                        </Link>

                        <p className="mt-0.5 text-xs text-fg-muted">
                            {item.size && <>{item.size} · </>}
                            {since(item.lastAt)}
                        </p>

                        <p className="mt-1 text-sm font-medium tabular text-fg">
                            {item.price === null ? "No longer sold" : money(item.price)}
                        </p>

                        {item.rebuy ? (
                            <button
                                type="button"
                                onClick={() => add(item.rebuy)}
                                disabled={pending.startsWith(`${item.productId}_`)}
                                className="mt-2 text-sm text-link disabled:opacity-50"
                            >
                                Add to cart
                            </button>
                        ) : (
                            <p className="mt-2 text-xs text-fg-muted">Out of stock</p>
                        )}
                    </article>
                ))}
            </div>
        </section>
    );
};

export default RestockRow;
