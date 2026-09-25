"use client";

import { useState } from "react";
import axios from "axios";
import { ClockIcon } from "@heroicons/react/24/outline";

import Button from "@/components/ui/Button";
import Sheet from "@/components/ui/Sheet";
import { EmptyState, Notice } from "@/components/ui/Layout";
import useAddToCart from "@/components/cart/useAddToCart";
import ShoppingCard from "./ShoppingCard";

const dayOf = (value: any) => {
    if (!value) return "";

    const days = Math.floor((Date.now() - new Date(value).getTime()) / 86400000);

    if (days <= 0) return "Viewed today";
    if (days === 1) return "Viewed yesterday";
    if (days < 30) return `Viewed ${days} days ago`;
    return `Viewed ${new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}`;
};

const ViewedView = ({ items: initial, historyOff }: any) => {
    const [items, setItems] = useState<any[]>(initial || []);
    const [confirming, setConfirming] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const { add, pending } = useAddToCart();

    const clear = async () => {
        setError("");
        setBusy(true);

        try {
            await axios.delete("/api/user/history");
            setItems([]);
            setConfirming(false);
        } catch (err: any) {
            setError(err.response?.data?.message || "That couldn't be cleared.");
        } finally {
            setBusy(false);
        }
    };

    if (!items.length) {
        return (
            <EmptyState
                icon={ClockIcon}
                title="Nothing here yet"
                description={
                    historyOff
                        ? "History is switched off in your shopping preferences, so nothing is being recorded."
                        : "Products you open are listed here, newest first, so you can get back to one without searching for it again."
                }
                action={<Button href="/browse">Start browsing</Button>}
            />
        );
    }

    return (
        <>
            {error && <Notice tone="danger" className="mb-4">{error}</Notice>}

            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item: any) => {
                    const href = `/product/${item.slug}?style=${item.style}`;

                    return (
                        <li key={item.key}>
                            <ShoppingCard
                                item={item}
                                href={href}
                                note={dayOf(item.viewedAt)}
                                action={
                                    item.inStock && !item.hasOptions ? (
                                        <button
                                            type="button"
                                            onClick={() => add({ productId: item.productId, style: item.style })}
                                            disabled={pending.startsWith(`${item.productId}_`)}
                                            className="text-link disabled:opacity-50"
                                        >
                                            Add to cart
                                        </button>
                                    ) : null
                                }
                            />
                        </li>
                    );
                })}
            </ul>

            <div className="mt-8 border-t border-line pt-5">
                <Button variant="outline" onClick={() => setConfirming(true)}>
                    Clear browsing history
                </Button>
                <p className="mt-2 text-sm text-fg-muted">
                    Clearing empties this list for good. It doesn&apos;t stop new products being recorded — that
                    switch is in your shopping preferences.
                </p>
            </div>

            <Sheet
                open={confirming}
                onClose={() => setConfirming(false)}
                side="center"
                title="Clear your browsing history?"
                footer={
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setConfirming(false)}>
                            Keep it
                        </Button>
                        <Button variant="danger" loading={busy} onClick={clear}>
                            Clear {items.length} item{items.length === 1 ? "" : "s"}
                        </Button>
                    </div>
                }
            >
                <p className="text-sm text-fg-muted">
                    This removes every product from the list. Your orders, saved items and lists are untouched.
                </p>
            </Sheet>
        </>
    );
};

export default ViewedView;
