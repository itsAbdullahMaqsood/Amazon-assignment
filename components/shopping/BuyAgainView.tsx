"use client";

import Link from "next/link";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

import Button from "@/components/ui/Button";
import { EmptyState, SectionHeader } from "@/components/ui/Layout";
import useAddToCart from "@/components/cart/useAddToCart";
import ShoppingCard from "./ShoppingCard";

const since = (value: any) => {
    const days = Math.floor((Date.now() - new Date(value).getTime()) / 86400000);

    if (days <= 0) return "Bought today";
    if (days === 1) return "Bought yesterday";
    if (days < 30) return `Bought ${days} days ago`;
    if (days < 60) return "Bought last month";
    return `Bought ${Math.round(days / 30)} months ago`;
};

const BuyAgainView = ({ groups, total, search }: any) => {
    const { add, pending } = useAddToCart();

    if (!total) {
        return (
            <EmptyState
                icon={ArrowPathIcon}
                title={search ? `Nothing you've bought matches “${search}”` : "Nothing to buy again yet"}
                description={
                    search
                        ? "Try another word, or look through everything you've bought."
                        : "Once an order is paid for, everything in it turns up here in the colour and size you chose."
                }
                action={
                    search ? (
                        <Button href="/buy-again" variant="outline">
                            Show everything
                        </Button>
                    ) : (
                        <>
                            <Button href="/browse">Start shopping</Button>
                            <Button href="/profile/orders" variant="outline">
                                Your orders
                            </Button>
                        </>
                    )
                }
            />
        );
    }

    return (
        <div className="space-y-10">
            {groups.map((group: any) => (
                <section key={group.name}>
                    <SectionHeader
                        title={group.name}
                        action={
                            group.slug && (
                                <Link href={`/browse?category=${group.slug}`} className="whitespace-nowrap text-link">
                                    See more
                                </Link>
                            )
                        }
                    />

                    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {group.items.map((item: any) => (
                            <li key={item.key}>
                                <ShoppingCard
                                    item={item}
                                    href={item.slug ? `/product/${item.slug}` : "/profile/orders"}
                                    note={
                                        <>
                                            {since(item.lastAt)}
                                            {item.size && <> · size {item.size}</>}
                                            {item.times > 1 && <> · {item.times} bought in all</>}
                                        </>
                                    }
                                    action={
                                        item.rebuy ? (
                                            <button
                                                type="button"
                                                onClick={() => add(item.rebuy)}
                                                disabled={pending.startsWith(`${item.productId}_`)}
                                                className="text-link disabled:opacity-50"
                                            >
                                                Add to cart
                                            </button>
                                        ) : (
                                            <span className="text-xs text-fg-muted">
                                                {item.price === null
                                                    ? "This one has left the catalogue."
                                                    : "That colour and size have gone — open the product for what's left."}
                                            </span>
                                        )
                                    }
                                />
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
};

export default BuyAgainView;
