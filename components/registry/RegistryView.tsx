"use client";

import { useState } from "react";
import axios from "axios";
import { GiftIcon } from "@heroicons/react/24/outline";

import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { EmptyState, Notice, PageHeader } from "@/components/ui/Layout";
import useAddToCart from "@/components/cart/useAddToCart";
import ShoppingCard from "@/components/shopping/ShoppingCard";

// Someone else's list, opened from its link or from search. Buying from it is
// the ordinary cart; marking a gift bought is a note to the other guests,
// because Markaz has no way of telling that an order was for this list.
const boughtNote = (item: any, mine: boolean) =>
    mine ? "You've marked this as bought" : `${item.buyerName || "Someone"} has bought this`;

const RegistryView = ({ list, viewerId, isOwner }: any) => {
    const signedIn = Boolean(viewerId);
    const [items, setItems] = useState<any[]>(list.items);
    const [busy, setBusy] = useState("");
    const [error, setError] = useState("");
    const { add, pending } = useAddToCart();

    const bought = items.filter((item) => item.purchasedAt).length;

    const toggle = async (item: any) => {
        setError("");
        setBusy(item._id);

        try {
            const { data } = await axios.post("/api/registry/purchase", { list_id: list._id, item_id: item._id });
            setItems((current) =>
                current.map((entry) =>
                    entry._id === item._id
                        ? { ...entry, purchasedAt: data.bought ? new Date().toISOString() : null, purchasedBy: data.bought ? viewerId : "" }
                        : entry
                )
            );
        } catch (err: any) {
            setError(err.response?.data?.message || "That couldn't be saved.");
        } finally {
            setBusy("");
        }
    };

    return (
        <>
            <PageHeader
                title={list.name}
                eyebrow={<span className="text-sm text-fg-muted">A list by {isOwner ? "you" : list.owner}</span>}
                description={
                    <>
                        {items.length} item{items.length === 1 ? "" : "s"}
                        {bought > 0 && (
                            <>
                                {" "}
                                · {bought} of {items.length} already bought
                            </>
                        )}
                    </>
                }
                action={isOwner ? <Button href={`/lists/${list._id}`} variant="outline">Edit this list</Button> : undefined}
            />

            {error && <Notice tone="danger" className="mb-4">{error}</Notice>}

            <Notice tone="neutral" className="mb-6">
                Buying from a list is an ordinary Markaz order — nothing is reserved and nothing is sent to{" "}
                {isOwner ? "you" : list.owner} automatically. Marking a gift as bought is a note to the other people
                looking at this list, so two of you don&apos;t buy the same thing.
            </Notice>

            {items.length === 0 ? (
                <EmptyState icon={GiftIcon} title="Nothing on this list yet" description={`${list.owner} hasn't added anything.`} />
            ) : (
                <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((item: any) => {
                        const mine = Boolean(item.purchasedAt) && String(item.purchasedBy) === String(viewerId);

                        return (
                        <li key={item._id}>
                            <ShoppingCard
                                item={item}
                                href={`/product/${item.slug}?style=${item.style}`}
                                aside={item.purchasedAt ? <Badge tone="success">Bought</Badge> : undefined}
                                note={item.purchasedAt ? boughtNote(item, mine) : undefined}
                                action={
                                    <>
                                        {item.inStock && !item.hasOptions ? (
                                            <button
                                                type="button"
                                                onClick={() => add({ productId: item.productId, style: item.style })}
                                                disabled={pending.startsWith(`${item.productId}_`)}
                                                className="text-link disabled:opacity-50"
                                            >
                                                Add to cart
                                            </button>
                                        ) : item.hasOptions ? (
                                            <a href={`/product/${item.slug}?style=${item.style}`} className="text-link">
                                                Choose a size
                                            </a>
                                        ) : null}

                                        {signedIn && !isOwner && (!item.purchasedAt || mine) && (
                                            <button
                                                type="button"
                                                onClick={() => toggle(item)}
                                                disabled={busy === item._id}
                                                className="text-link disabled:opacity-50"
                                            >
                                                {mine ? "I didn't buy it" : "I've bought this"}
                                            </button>
                                        )}
                                    </>
                                }
                            />
                        </li>
                        );
                    })}
                </ul>
            )}
        </>
    );
};

export default RegistryView;
