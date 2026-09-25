"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowUturnLeftIcon, HeartIcon, ShieldCheckIcon, TruckIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

import { useAppDispatch } from "@/redux/hooks";
import { pushToast } from "@/redux/slices/ToastSlice";
import Price, { money } from "@/components/ui/Price";
import Rating from "@/components/ui/Rating";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import QuantityStepper from "@/components/ui/QuantityStepper";
import { cn } from "@/components/ui/cn";
import useAddToCart from "@/components/cart/useAddToCart";
import { hasSizeChoice } from "@/utils/sizes";

const stockLine = (qty: number) =>
    qty < 1
        ? { tone: "danger", text: "Out of stock in this option" }
        : qty <= 10
          ? { tone: "warning", text: `Only ${qty} left` }
          : { tone: "success", text: "In stock" };

const returnsLine = (policy: string) => {
    const days = String(policy || "").match(/(\d+)\s*day/i);
    if (days) return `${days[1]}-day returns`;
    if (/no return/i.test(policy || "")) return "This item can't be returned";
    return policy || "Returns as stated at checkout";
};

// Everything needed to decide, in the order it is decided: what it is, what it
// costs, which option, how many, when it arrives, what if it's wrong. One price,
// one primary button.
const BuyPanel = ({ product, saved: initialSaved, delivery, onPreview }: any) => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const { data: session }: any = useSession();
    const { add, isPending } = useAddToCart();

    const [qty, setQty] = useState(1);
    const [saved, setSaved] = useState(initialSaved);
    const [saving, setSaving] = useState(false);
    const [tracked, setTracked] = useState(`${product.style}-${product.size}`);

    // A new option resets the quantity to what that option can supply.
    if (tracked !== `${product.style}-${product.size}`) {
        setTracked(`${product.style}-${product.size}`);
        setQty(1);
    }

    const stock = stockLine(product.quantity);
    const warranty = product.details?.find((d: any) => /warranty/i.test(d.name))?.value;
    const dispatchTime = product.details?.find((d: any) => /dispatch/i.test(d.name))?.value;
    const variant = product.variants[product.style];
    const optionHref = (style: number, size?: number) =>
        `/product/${product.slug}?style=${style}${size !== undefined ? `&size=${size}` : ""}`;

    const toggleSave = async () => {
        if (!session) {
            router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`${pathname}?style=${product.style}`)}`);
            return;
        }

        setSaving(true);

        try {
            if (saved) {
                await axios.delete("/api/user/wishlist", { data: { product_id: product._id, style: product.style } });
            } else {
                await axios.put("/api/user/wishlist", { product_id: product._id, style: product.style });
            }

            setSaved(!saved);
            dispatch(
                pushToast({
                    title: saved ? "Removed from saved items" : "Saved for later",
                    image: product.images?.[0]?.url,
                    secondary: saved ? undefined : { label: "Saved items", href: "/profile/wishlist" },
                })
            );
        } catch (error: any) {
            dispatch(pushToast({ title: "Couldn't update saved items", body: error.response?.data?.message, tone: "danger" }));
        } finally {
            setSaving(false);
        }
    };

    const addHandler = () => add({ productId: product._id, style: product.style, size: product.size, qty });

    return (
        <div className="flex flex-col gap-5">
            <div>
                {product.brand && (
                    <Link href={`/browse?brand=${encodeURIComponent(product.brand)}`} className="text-sm font-medium text-accent-ink hover:underline">
                        {product.brand}
                    </Link>
                )}
                <h1 className="mt-1 font-display text-2xl font-semibold leading-tight tracking-tight text-fg md:text-3xl">{product.name}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {product.numberReviews > 0 ? (
                        <Rating value={product.rating} count={product.numberReviews} size="md" href="#reviews" />
                    ) : (
                        <span className="text-sm text-fg-muted">No reviews yet</span>
                    )}
                    {product.rating >= 4.5 && product.numberReviews >= 3 && <Badge tone="accent">Top pick</Badge>}
                    {product.sold > 0 && <span className="text-sm text-fg-muted tabular">{product.sold.toLocaleString()} sold</span>}
                </div>
            </div>

            <Price value={product.price} listPrice={product.priceBefore} size="xl" />

            {product.variants.length > 1 && (
                <fieldset>
                    <legend className="text-sm text-fg-muted">
                        {variant?.name ? "Colour" : "Style"}: <span className="font-medium text-fg">{variant?.name || `${product.style + 1} of ${product.variants.length}`}</span>
                    </legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {product.variants.map((option: any, i: number) => (
                            <Link
                                key={i}
                                href={optionHref(i)}
                                scroll={false}
                                replace
                                onMouseEnter={() => onPreview(option.thumbnail)}
                                onMouseLeave={() => onPreview("")}
                                aria-label={`${option.name || `Style ${i + 1}`}${option.inStock ? "" : ", out of stock"}`}
                                aria-current={product.style === i}
                                className={cn(
                                    "relative flex items-center justify-center overflow-hidden ring-offset-2 ring-offset-surface",
                                    option.color ? "h-11 w-11 rounded-full" : "h-14 w-14 rounded-card bg-surface-muted",
                                    product.style === i ? "ring-2 ring-accent-ink" : "ring-1 ring-line-strong hover:ring-fg-subtle",
                                    !option.inStock && "opacity-40"
                                )}
                            >
                                {option.color ? (
                                    <span className="h-9 w-9 rounded-full ring-1 ring-line" style={{ backgroundColor: option.color }} />
                                ) : (
                                    option.thumbnail && <Image src={option.thumbnail} alt="" fill sizes="56px" className="object-contain p-1" />
                                )}
                            </Link>
                        ))}
                    </div>
                </fieldset>
            )}

            {hasSizeChoice(product.sizes) && (
                <fieldset>
                    <legend className="text-sm text-fg-muted">
                        Size: <span className="font-medium text-fg">{product.sizes[product.size]?.size}</span>
                    </legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {product.sizes.map((entry: any, i: number) => (
                            <Link
                                key={entry.size}
                                href={optionHref(product.style, i)}
                                scroll={false}
                                replace
                                aria-current={product.size === i}
                                aria-disabled={entry.qty < 1}
                                className={cn(
                                    "flex min-w-12 flex-col items-center rounded-card border px-3 py-1.5 text-sm",
                                    product.size === i ? "border-accent-ink bg-accent-soft text-fg ring-1 ring-accent-ink" : "border-line-strong text-fg hover:border-fg-subtle",
                                    entry.qty < 1 && "text-fg-subtle line-through"
                                )}
                            >
                                <span className="font-medium">{entry.size}</span>
                                {product.sizes.some((other: any) => other.price !== entry.price) && (
                                    <span className="text-xs text-fg-muted tabular">{money(entry.price)}</span>
                                )}
                            </Link>
                        ))}
                    </div>
                </fieldset>
            )}

            <div className="rounded-panel border border-line bg-surface p-4">
                <p className={cn("text-sm font-medium", stock.tone === "danger" ? "text-danger" : stock.tone === "warning" ? "text-warning" : "text-success")}>
                    {stock.text}
                </p>

                <div className="mt-3 flex gap-2">
                    <QuantityStepper value={qty} max={Math.max(1, product.quantity)} onChange={setQty} disabled={product.quantity < 1} />
                    <Button size="md" block onClick={addHandler} loading={isPending(product._id)} disabled={product.quantity < 1} className="h-10">
                        Add to cart
                    </Button>
                    <button
                        type="button"
                        onClick={toggleSave}
                        disabled={saving}
                        aria-pressed={saved}
                        aria-label={saved ? "Remove from saved items" : "Save for later"}
                        title={saved ? "Saved" : "Save for later"}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card border border-line-strong text-fg hover:bg-surface-muted disabled:opacity-60 cursor-pointer"
                    >
                        {saved ? <HeartSolid className="h-5 w-5 text-danger" /> : <HeartIcon className="h-5 w-5" />}
                    </button>
                </div>

                <ul className="mt-4 space-y-2.5 text-sm">
                    <li className="flex gap-2.5">
                        <TruckIcon className="h-5 w-5 shrink-0 text-fg-subtle" />
                        <span>
                            <span className="font-medium">{product.shipping > 0 ? `${money(product.shipping)} delivery` : "Free delivery"}</span>
                            <span className="text-fg-muted">
                                {" "}
                                · estimated {delivery.from} – {delivery.to}
                                {dispatchTime && <>, {dispatchTime.toLowerCase()}</>}
                            </span>
                        </span>
                    </li>
                    <li className="flex gap-2.5">
                        <ArrowUturnLeftIcon className="h-5 w-5 shrink-0 text-fg-subtle" />
                        <span>{returnsLine(product.refundPolicy)}</span>
                    </li>
                    {warranty && (
                        <li className="flex gap-2.5">
                            <ShieldCheckIcon className="h-5 w-5 shrink-0 text-fg-subtle" />
                            <span>{warranty}</span>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default BuyPanel;
