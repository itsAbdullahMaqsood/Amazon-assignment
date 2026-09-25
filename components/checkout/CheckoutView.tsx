"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { CheckCircleIcon, PlusIcon } from "@heroicons/react/24/outline";

import { useAppDispatch } from "@/redux/hooks";
import { emptyCart } from "@/redux/slices/CartSlice";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Checkbox, RadioCard } from "@/components/ui/Choice";
import { Container, Notice } from "@/components/ui/Layout";
import { money } from "@/components/ui/Price";
import { cn } from "@/components/ui/cn";
import { addressLines } from "@/lib/address";
import { paymentMethods, paidOnPlacement } from "@/lib/payments";
import AddressForm from "./AddressForm";

const Step = ({ number, title, done, summary, onEdit, children }: any) => (
    <section className="rounded-panel border border-line bg-surface">
        <div className="flex items-start gap-3 p-4 md:p-5">
            <span
                className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                    done ? "bg-success-soft text-success" : "bg-ink-900 text-fg-inverse"
                )}
            >
                {done ? <CheckCircleIcon className="h-5 w-5" /> : number}
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="font-display text-lg font-semibold leading-7">{title}</h2>
                    {done && onEdit && (
                        <button type="button" onClick={onEdit} className="text-sm text-link">
                            Change
                        </button>
                    )}
                </div>
                {done && summary && <div className="mt-1 text-sm text-fg-muted">{summary}</div>}
            </div>
        </div>
        {!done && <div className="px-4 pb-5 md:px-5 md:pl-15">{children}</div>}
    </section>
);

// One page, three steps. Each step collapses to a one-line summary once it is
// settled, and the order summary beside it is the server's quote: the same
// numbers placing the order will charge.
const CheckoutView = ({ addresses: initialAddresses, defaultPayment, initialQuote }: any) => {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const [addresses, setAddresses] = useState<any[]>(initialAddresses);
    const [addressId, setAddressId] = useState<string>(
        (initialAddresses.find((a: any) => a.active) || initialAddresses[0])?._id || ""
    );
    const [editingAddress, setEditingAddress] = useState(!initialAddresses.length);
    const [adding, setAdding] = useState(!initialAddresses.length);

    const [payment, setPayment] = useState<string>(paymentMethods.some((m) => m.id === defaultPayment) ? defaultPayment : "");
    const [editingPayment, setEditingPayment] = useState(!payment);

    const [quote, setQuote] = useState<any>(initialQuote);
    const [couponOpen, setCouponOpen] = useState(false);
    const [couponInput, setCouponInput] = useState("");
    const [coupon, setCoupon] = useState("");
    const [useGiftCard, setUseGiftCard] = useState(true);
    const [quoting, setQuoting] = useState(false);
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState("");

    const address = addresses.find((a: any) => a._id === addressId);
    const method = paymentMethods.find((m) => m.id === payment);

    const requote = async (next: { coupon?: string; useGiftCard?: boolean }) => {
        setQuoting(true);

        try {
            const { data } = await axios.post("/api/checkout/quote", {
                coupon: next.coupon ?? coupon,
                useGiftCard: next.useGiftCard ?? useGiftCard,
            });

            setQuote(data);
            return data;
        } finally {
            setQuoting(false);
        }
    };

    const applyCoupon = async (e: any) => {
        e.preventDefault();
        const data = await requote({ coupon: couponInput });

        if (data.coupon) {
            setCoupon(data.coupon.code);
            setCouponOpen(false);
        }
    };

    const removeCoupon = async () => {
        setCoupon("");
        setCouponInput("");
        await requote({ coupon: "" });
    };

    const chooseAddress = (id: string) => {
        setAddressId(id);
        // Remembered as the account's active address for next time.
        axios.put("/api/user/manageaddress", { id }).catch(() => {});
    };

    const place = async () => {
        setError("");

        if (!address) {
            setEditingAddress(true);
            setError("Choose where to deliver.");
            return;
        }

        if (!method) {
            setEditingPayment(true);
            setError("Choose how to pay.");
            return;
        }

        setPlacing(true);

        try {
            const { data } = await axios.post("/api/order/create", {
                addressId,
                paymentMethod: payment,
                coupon,
                useGiftCard,
            });

            dispatch(emptyCart());
            router.push(`/order/${data.order_id}?placed=1`);
        } catch (err: any) {
            setPlacing(false);
            setError(err.response?.data?.message || "The order couldn't be placed. Nothing was charged.");
            requote({}).catch(() => {});
        }
    };

    const blocked = quote.problems.length > 0;
    const actionLabel = method && !paidOnPlacement(method.id) ? "Place order" : `Pay ${money(quote.total)}`;

    const summary = (
        <Card className="lg:sticky lg:top-6">
            <h2 className="font-display text-lg font-semibold">Order summary</h2>

            <dl className={cn("mt-4 space-y-2 text-sm transition-opacity", quoting && "opacity-50")}>
                <div className="flex justify-between">
                    <dt className="text-fg-muted">Items ({quote.items})</dt>
                    <dd className="tabular">{money(quote.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-fg-muted">Delivery</dt>
                    <dd className="tabular">{quote.shipping > 0 ? money(quote.shipping) : "Free"}</dd>
                </div>
                {quote.coupon && (
                    <div className="flex justify-between text-success">
                        <dt>
                            {quote.coupon.code} (−{quote.coupon.percent}%){" "}
                            <button type="button" onClick={removeCoupon} className="ml-1 text-fg-muted underline cursor-pointer">
                                remove
                            </button>
                        </dt>
                        <dd className="tabular">−{money(quote.discount)}</dd>
                    </div>
                )}
                {quote.giftCard > 0 && (
                    <div className="flex justify-between text-success">
                        <dt>Gift card</dt>
                        <dd className="tabular">−{money(quote.giftCard)}</dd>
                    </div>
                )}
                <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
                    <dt>Total</dt>
                    <dd className="tabular">{money(quote.total)}</dd>
                </div>
            </dl>

            {!quote.coupon &&
                (couponOpen ? (
                    <form onSubmit={applyCoupon} className="mt-4">
                        <label htmlFor="coupon" className="text-sm font-medium">
                            Coupon code
                        </label>
                        <div className="mt-1.5 flex gap-2">
                            <input
                                id="coupon"
                                value={couponInput}
                                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                autoComplete="off"
                                autoFocus
                                className="h-10 min-w-0 flex-1 rounded-control border border-line-strong bg-surface px-3 text-sm uppercase tracking-wide outline-none focus:border-accent-ink"
                            />
                            <Button type="submit" variant="secondary" loading={quoting} disabled={!couponInput.trim()}>
                                Apply
                            </Button>
                        </div>
                        {quote.couponError && couponInput && <p className="mt-1.5 text-sm text-danger">{quote.couponError}</p>}
                    </form>
                ) : (
                    <button type="button" onClick={() => setCouponOpen(true)} className="mt-4 text-sm text-link">
                        Have a coupon code?
                    </button>
                ))}

            {quote.giftCardBalance > 0 && (
                <div className="mt-4 rounded-card bg-surface-muted p-3">
                    <Checkbox
                        checked={useGiftCard}
                        onChange={(e: any) => {
                            setUseGiftCard(e.target.checked);
                            requote({ useGiftCard: e.target.checked });
                        }}
                        label={`Use my gift card balance (${money(quote.giftCardBalance)})`}
                        description="Whatever it doesn't cover is paid with the method you choose."
                    />
                </div>
            )}

            {(error || blocked) && (
                <Notice tone="danger" className="mt-4" title={blocked ? "Something in your cart changed" : undefined}>
                    {blocked ? (
                        <>
                            {quote.problems.join(" ")}{" "}
                            <Link href="/cart" className="font-medium text-fg underline">
                                Update your cart
                            </Link>
                        </>
                    ) : (
                        error
                    )}
                </Notice>
            )}

            <Button size="lg" block className="mt-5 hidden lg:flex" onClick={place} loading={placing} disabled={blocked || quoting}>
                {actionLabel}
            </Button>
            <p className="mt-3 text-center text-xs text-fg-subtle">
                Payments in this store are simulated. No card details are asked for and no money moves.
            </p>
        </Card>
    );

    return (
        <main className="pb-24 lg:pb-10">
            <Container className="max-w-5xl">
                <h1 className="pb-6 pt-6 font-display text-2xl font-semibold tracking-tight md:pt-10 md:text-3xl">Checkout</h1>

                <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
                    <div className="space-y-4">
                        <Step
                            number={1}
                            title="Delivery address"
                            done={!!address && !editingAddress}
                            onEdit={() => setEditingAddress(true)}
                            summary={
                                address && (
                                    <>
                                        <span className="text-fg">
                                            {address.firstName} {address.lastName}
                                        </span>
                                        , {addressLines(address).join(", ")}
                                    </>
                                )
                            }
                        >
                            {addresses.length > 0 && !adding && (
                                <div className="space-y-2">
                                    {addresses.map((entry: any) => (
                                        <RadioCard
                                            key={entry._id}
                                            name="address"
                                            checked={entry._id === addressId}
                                            onChange={() => chooseAddress(entry._id)}
                                            label={`${entry.firstName} ${entry.lastName}`}
                                            description={
                                                <>
                                                    {addressLines(entry).join(", ")}
                                                    <br />
                                                    {entry.phoneNumber}
                                                </>
                                            }
                                        />
                                    ))}
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <Button onClick={() => setEditingAddress(false)} disabled={!address}>
                                            Deliver here
                                        </Button>
                                        <Button variant="ghost" onClick={() => setAdding(true)}>
                                            <PlusIcon className="h-4 w-4" />
                                            New address
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {adding && (
                                <AddressForm
                                    onSaved={(next: any[]) => {
                                        setAddresses(next);
                                        setAddressId((next.find((a) => a.active) || next[next.length - 1])._id);
                                        setAdding(false);
                                        setEditingAddress(false);
                                    }}
                                    onCancel={addresses.length ? () => setAdding(false) : undefined}
                                />
                            )}
                        </Step>

                        <Step
                            number={2}
                            title="Payment"
                            done={!!method && !editingPayment}
                            onEdit={() => setEditingPayment(true)}
                            summary={method && <span className="text-fg">{method.name}</span>}
                        >
                            <div className="space-y-2">
                                {paymentMethods.map((option) => (
                                    <RadioCard
                                        key={option.id}
                                        name="payment"
                                        checked={payment === option.id}
                                        onChange={() => setPayment(option.id)}
                                        label={option.name}
                                        description={option.description}
                                    />
                                ))}
                            </div>
                            <Button className="mt-4" onClick={() => setEditingPayment(false)} disabled={!method}>
                                Use {method?.name || "this method"}
                            </Button>
                        </Step>

                        <Step number={3} title={`Review ${quote.items} item${quote.items === 1 ? "" : "s"}`}>
                            <ul className="divide-y divide-line">
                                {quote.lines.map((line: any, i: number) => (
                                    <li key={i} className={cn("flex gap-3 py-3", line.unavailable && "opacity-50")}>
                                        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-control bg-surface-muted">
                                            {line.image && <Image src={line.image} alt="" fill sizes="64px" className="object-contain p-1" />}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="line-clamp-2 text-sm font-medium">{line.name}</p>
                                            <p className="text-sm text-fg-muted">
                                                {line.qty} × {money(line.price)}
                                                {line.size && !/^one size$/i.test(line.size) && <> · Size {line.size}</>}
                                                {line.shipping > 0 && <> · +{money(line.shipping)} delivery</>}
                                            </p>
                                        </div>
                                        <p className="text-sm font-medium tabular">{money(line.price * line.qty)}</p>
                                    </li>
                                ))}
                            </ul>
                            <Link href="/cart" className="mt-2 inline-block text-sm text-link">
                                Change quantities in your cart
                            </Link>
                        </Step>
                    </div>

                    <div>{summary}</div>
                </div>
            </Container>

            <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
                <div className="flex-1">
                    <p className="text-xs text-fg-muted">Total</p>
                    <p className="font-semibold tabular">{money(quote.total)}</p>
                </div>
                <Button onClick={place} loading={placing} disabled={blocked || quoting}>
                    {actionLabel}
                </Button>
            </div>
        </main>
    );
};

export default CheckoutView;
