"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { CheckIcon, ClipboardDocumentIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";

import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { EmptyState, Notice, PageHeader } from "@/components/ui/Layout";
import useAddToCart from "@/components/cart/useAddToCart";
import ShoppingCard from "@/components/shopping/ShoppingCard";
import { isShareable, privacyLabel } from "@/lib/lists";
import ListFormSheet from "./ListFormSheet";

// Your own list. Everything about it can be changed here; sharing is a link,
// and the link is the public page other people see.
const ListDetail = ({ list: initial }: any) => {
    const router = useRouter();
    const [list, setList] = useState<any>(initial);
    const [items, setItems] = useState<any[]>(initial.items);
    const [editing, setEditing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");
    const { add, pending } = useAddToCart();

    const shareUrl = typeof window === "undefined" ? "" : `${window.location.origin}/registry/${list._id}`;

    const removeItem = async (item: any) => {
        setError("");

        try {
            await axios.delete("/api/user/lists", { data: { list_id: list._id, item_id: item._id } });
            setItems((current) => current.filter((entry) => entry._id !== item._id));
        } catch (err: any) {
            setError(err.response?.data?.message || "That couldn't be removed.");
        }
    };

    const saved = (data: any) => {
        const updated = data.lists.find((entry: any) => entry._id === list._id);
        setList({ ...list, ...updated });
        setEditing(false);
        router.refresh();
    };

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
        } catch {
            setCopied(false);
        }
    };

    return (
        <>
            <PageHeader
                title={list.name}
                eyebrow={
                    <Link href="/lists" className="text-sm text-link">
                        ‹ Your lists
                    </Link>
                }
                description={
                    <>
                        {items.length} item{items.length === 1 ? "" : "s"}
                        {list.bought > 0 && <> · {list.bought} marked bought</>} · {privacyLabel(list.privacy).toLowerCase()}
                    </>
                }
                action={
                    <Button variant="outline" onClick={() => setEditing(true)}>
                        Edit list
                    </Button>
                }
            />

            {error && <Notice tone="danger" className="mb-4">{error}</Notice>}

            {isShareable(list.privacy) ? (
                <div className="mb-6 flex flex-wrap items-center gap-3 rounded-card border border-line bg-surface-muted p-4">
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-fg">Share this list</p>
                        <p className="truncate text-sm text-fg-muted">{shareUrl}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={copy}>
                        {copied ? <CheckIcon className="h-4 w-4" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
                        {copied ? "Copied" : "Copy link"}
                    </Button>
                </div>
            ) : (
                <Notice tone="neutral" className="mb-6">
                    This list is private — only you can see it. Make it shared or public in <strong>Edit list</strong> to
                    give out a link.
                </Notice>
            )}

            {items.length === 0 ? (
                <EmptyState
                    icon={ShoppingBagIcon}
                    title="Nothing on this list yet"
                    description="Save a product first, then add it to a list from your saved items."
                    action={
                        <>
                            <Button href="/profile/wishlist">Your saved items</Button>
                            <Button href="/browse" variant="outline">
                                Browse the store
                            </Button>
                        </>
                    }
                />
            ) : (
                <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((item: any) => (
                        <li key={item._id}>
                            <ShoppingCard
                                item={item}
                                href={`/product/${item.slug}?style=${item.style}`}
                                aside={item.purchasedAt ? <Badge tone="success">Bought</Badge> : undefined}
                                note={item.purchasedAt ? `${item.buyerName || "Someone"} has bought this` : undefined}
                                action={
                                    <>
                                        {item.inStock && !item.hasOptions && (
                                            <button
                                                type="button"
                                                onClick={() => add({ productId: item.productId, style: item.style })}
                                                disabled={pending.startsWith(`${item.productId}_`)}
                                                className="text-link disabled:opacity-50"
                                            >
                                                Add to cart
                                            </button>
                                        )}
                                        <button type="button" onClick={() => removeItem(item)} className="text-link">
                                            Remove
                                        </button>
                                    </>
                                }
                            />
                        </li>
                    ))}
                </ul>
            )}

            <ListFormSheet open={editing} onClose={() => setEditing(false)} list={list} onSaved={saved} />
        </>
    );
};

export default ListDetail;
