"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { BookmarkIcon } from "@heroicons/react/24/outline";

import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Rating from "@/components/ui/Rating";
import Price from "@/components/ui/Price";
import { EmptyState, Notice } from "@/components/ui/Layout";
import useAddToCart from "@/components/cart/useAddToCart";
import AddToListSheet from "@/components/lists/AddToListSheet";

// Saved items are priced from the catalogue on every visit, so this list never
// promises yesterday's price. A saved thing you can buy in one option goes
// straight into the cart; one with sizes opens its page, because picking a size
// for someone is a guess.
const SavedItems = ({ items: initial }: any) => {
    const [items, setItems] = useState<any[]>(initial || []);
    const [removing, setRemoving] = useState("");
    const [listing, setListing] = useState<any>(null);
    const [error, setError] = useState("");
    const { add, pending } = useAddToCart();

    const remove = async (item: any) => {
        setError("");
        setRemoving(item.key);

        try {
            await axios.delete("/api/user/wishlist", { data: { product_id: item.productId, style: item.style } });
            setItems((list) => list.filter((entry) => entry.key !== item.key));
        } catch (err: any) {
            setError(err.response?.data?.message || "That couldn't be removed.");
        } finally {
            setRemoving("");
        }
    };

    if (!items.length) {
        return (
            <EmptyState
                icon={BookmarkIcon}
                title="Nothing saved yet"
                description="Save from a product page, or from the cart when you're not ready to buy. Saved items keep their place while their price stays current."
                action={<Button href="/browse">Find something to save</Button>}
            />
        );
    }

    return (
        <>
            {error && <Notice tone="danger" className="mb-4">{error}</Notice>}

            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item: any) => {
                    const href = `/product/${item.slug}?style=${item.style}`;

                    return (
                        <li key={item.key} className="flex gap-4 rounded-card border border-line bg-surface p-4">
                            <Link href={href} aria-hidden="true" tabIndex={-1} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-control bg-surface-muted">
                                {item.image && <Image src={item.image} alt="" fill sizes="96px" className="object-contain p-1.5" />}
                            </Link>

                            <div className="flex min-w-0 flex-1 flex-col">
                                <Link href={href} className="line-clamp-2 text-sm font-medium text-fg hover:underline underline-offset-2">
                                    {item.name}
                                </Link>

                                {item.numberReviews > 0 && <Rating value={item.rating} count={item.numberReviews} className="mt-1" />}

                                <div className="mt-1 flex items-center gap-2">
                                    <Price value={item.price} listPrice={item.listPrice} size="sm" showSaving={false} />
                                    {!item.inStock && <Badge tone="neutral">Out of stock</Badge>}
                                </div>

                                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 text-sm">
                                    {item.inStock &&
                                        (item.hasOptions ? (
                                            <Link href={href} className="text-link">
                                                Choose a size
                                            </Link>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => add({ productId: item.productId, style: Number(item.style) })}
                                                disabled={pending.startsWith(`${item.productId}_`)}
                                                className="text-link disabled:opacity-50"
                                            >
                                                Add to cart
                                            </button>
                                        ))}

                                    <button type="button" onClick={() => setListing(item)} className="text-link">
                                        Add to a list
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => remove(item)}
                                        disabled={removing === item.key}
                                        className="text-link disabled:opacity-50"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>

            <AddToListSheet item={listing} open={!!listing} onClose={() => setListing(null)} />
        </>
    );
};

export default SavedItems;
