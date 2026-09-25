"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { LockClosedIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateCart } from "@/redux/slices/CartSlice";
import { pushToast } from "@/redux/slices/ToastSlice";
import { saveCart, updateCart as repriceCart } from "@/request/users";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Container, EmptyState, Notice, PageHeader, Skeleton } from "@/components/ui/Layout";
import { money } from "@/components/ui/Price";
import ProductRail from "@/components/landing/ProductRail";
import { summarize } from "@/lib/pricing";
import CartLine from "./CartLine";

// The cart lives in the browser (redux-persist) so a guest can fill one. Every
// visit re-prices it against the database first; the totals shown are computed
// with the same function checkout charges with.
const CartView = ({ suggestions, suggestionsTitle }: any) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { status } = useSession();
    const lines = useAppSelector((state) => state.cart.cartItems);
    const [repriced, setRepriced] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);
    const [saving, setSaving] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        repriceCart(lines)
            .then((data) => {
                if (cancelled) return;
                // Never hold more than is in stock.
                dispatch(updateCart(data.map((line: any) => (line.quantity > 0 && line.qty > line.quantity ? { ...line, qty: line.quantity, capped: true } : line))));
            })
            .catch(() => {
                // Offline: show what we have; checkout re-prices on the server anyway.
            })
            .finally(() => !cancelled && setRepriced(true));

        return () => {
            cancelled = true;
        };
        // Re-price once per visit, not on every quantity change.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const buyable = lines.filter((line: any) => !line.unavailable);
    const totals = summarize(buyable);
    const capped = lines.some((line: any) => line.capped);

    const setQty = (uid: string, qty: number) =>
        dispatch(updateCart(lines.map((line: any) => (line._uid === uid ? { ...line, qty, capped: false } : line))));

    const remove = (uid: string) => dispatch(updateCart(lines.filter((line: any) => line._uid !== uid)));

    const saveForLater = async (line: any) => {
        if (status !== "authenticated") {
            router.push("/auth/signin?callbackUrl=/cart");
            return;
        }

        setSaving(line._uid);

        try {
            await axios.put("/api/user/wishlist", { product_id: line._id, style: line.style });
            remove(line._uid);
            dispatch(pushToast({ title: "Moved to saved items", body: line.name, image: line.images?.[0]?.url, secondary: { label: "Saved items", href: "/profile/wishlist" } }));
        } catch (err: any) {
            dispatch(pushToast({ title: "Couldn't save that", body: err.response?.data?.message, tone: "danger" }));
        } finally {
            setSaving("");
        }
    };

    const checkout = async () => {
        if (status !== "authenticated") {
            router.push("/auth/signin?callbackUrl=/cart");
            return;
        }

        setCheckingOut(true);
        setError("");

        try {
            // The server rebuilds the order lines from the database; nothing
            // here about price is trusted.
            await saveCart(buyable);
            router.push("/checkout");
        } catch (err: any) {
            setError(err.response?.data?.message || "Your cart couldn't be saved. Try again.");
            setCheckingOut(false);
        }
    };

    if (!lines.length) {
        return (
            <main>
                <Container className="pb-4">
                    <PageHeader title="Your cart" />
                    <EmptyState
                        icon={ShoppingBagIcon}
                        title="Your cart is empty"
                        description="Anything you add stays here, even if you leave and come back."
                        action={
                            <>
                                <Button href="/browse">Start shopping</Button>
                                <Button href="/coupons" variant="outline">
                                    See today&apos;s deals
                                </Button>
                            </>
                        }
                    />
                    {suggestions?.length > 0 && (
                        <div className="mt-14">
                            <ProductRail title={suggestionsTitle} products={suggestions} />
                        </div>
                    )}
                </Container>
            </main>
        );
    }

    const summary = (
        <Card className="lg:sticky lg:top-6">
            <h2 className="font-display text-lg font-semibold">Summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                    <dt className="text-fg-muted">
                        Items ({totals.items})
                    </dt>
                    <dd className="tabular">{money(totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-fg-muted">Delivery</dt>
                    <dd className="tabular">{totals.shipping > 0 ? money(totals.shipping) : "Free"}</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
                    <dt>Total</dt>
                    <dd className="tabular">{money(totals.total)}</dd>
                </div>
            </dl>
            <p className="mt-2 text-xs text-fg-muted">Coupons and gift card balance are applied at checkout.</p>

            {error && (
                <Notice tone="danger" className="mt-4">
                    {error}
                </Notice>
            )}

            <Button size="lg" block className="mt-5" onClick={checkout} loading={checkingOut} disabled={!buyable.length || !repriced}>
                {status === "authenticated" ? "Check out" : "Sign in to check out"}
            </Button>
            {status !== "authenticated" && <p className="mt-2 text-center text-xs text-fg-muted">Your cart stays as it is while you sign in.</p>}
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-fg-subtle">
                <LockClosedIcon className="h-3.5 w-3.5" />
                Prices are checked again when you place the order
            </p>
        </Card>
    );

    return (
        <main className="pb-24 lg:pb-0">
            <Container>
                <PageHeader title="Your cart" description={`${totals.items} item${totals.items === 1 ? "" : "s"}`} />

                {capped && (
                    <Notice tone="warning" className="mb-4" title="We lowered a quantity">
                        Some items don&apos;t have as many in stock as were in your cart.
                    </Notice>
                )}

                <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
                    <div>
                        {!repriced ? (
                            <div className="space-y-5 py-5">
                                {lines.map((line: any) => (
                                    <div key={line._uid} className="flex gap-4">
                                        <Skeleton className="h-24 w-24 rounded-card" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-2/3" />
                                            <Skeleton className="h-4 w-1/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <ul className="divide-y divide-line border-y border-line">
                                {lines.map((line: any) => (
                                    <CartLine
                                        key={line._uid}
                                        line={line}
                                        onQty={(qty: number) => setQty(line._uid, qty)}
                                        onRemove={() => remove(line._uid)}
                                        onSave={() => saveForLater(line)}
                                        saving={saving === line._uid}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>

                    <div>{summary}</div>
                </div>

                {suggestions?.length > 0 && (
                    <div className="mt-14 border-t border-line pt-10">
                        <ProductRail title={suggestionsTitle} products={suggestions} />
                    </div>
                )}
            </Container>

            <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
                <div className="flex-1">
                    <p className="text-xs text-fg-muted">Total</p>
                    <p className="font-semibold tabular">{money(totals.total)}</p>
                </div>
                <Button onClick={checkout} loading={checkingOut} disabled={!buyable.length || !repriced}>
                    {status === "authenticated" ? "Check out" : "Sign in to check out"}
                </Button>
            </div>
        </main>
    );
};

export default CartView;
