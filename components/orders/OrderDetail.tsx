"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { CheckCircleIcon, CheckIcon } from "@heroicons/react/24/solid";

import { useAppDispatch } from "@/redux/hooks";
import { pushToast } from "@/redux/slices/ToastSlice";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Breadcrumbs, Container, Notice } from "@/components/ui/Layout";
import { money } from "@/components/ui/Price";
import { cn } from "@/components/ui/cn";
import { addressLines } from "@/lib/address";
import { paymentName } from "@/lib/payments";
import { formatDate, orderNumber } from "@/lib/returns";
import StatusPill from "./StatusPill";
import BuyAgainButton from "./BuyAgainButton";
import ReturnSheet from "@/components/returns/ReturnSheet";

const dateTime = (value: any) =>
    new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

// The order's life as it actually happened, from the fields the order stores.
// A step with no timestamp (dispatch is not recorded) shows as done without
// inventing one.
const timeline = (order: any) => {
    if (order.status === "Cancelled") {
        return [
            { label: "Placed", at: order.createdAt, done: true },
            { label: "Cancelled", at: order.updatedAt, done: true, tone: "danger" },
        ];
    }

    const reached = ["Not Processed", "Processing", "Dispatched", "Completed"].indexOf(order.status);

    return [
        { label: "Placed", at: order.createdAt, done: true },
        {
            label: order.isPaid ? "Paid" : order.paymentMethod === "cash" ? "Pay on delivery" : "Awaiting payment",
            at: order.paidAt,
            done: order.isPaid,
        },
        { label: "Dispatched", done: reached >= 2 },
        { label: "Delivered", at: order.deliveredAt, done: reached >= 3 },
    ];
};

const OrderDetail = ({ order: initial, placed }: any) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [order, setOrder] = useState(initial);
    const [returning, setReturning] = useState<number | null>(null);
    const [paying, setPaying] = useState(false);

    const steps = timeline(order);
    const address = order.shippingAddress || {};
    const discount = Math.max(
        0,
        Math.round(((order.totalBeforeDiscount || 0) + (order.shippingPrice || 0) - (order.giftCardApplied || 0) - order.total) * 100) / 100
    );

    // Orders placed before checkout paid in one step may still be waiting.
    const pay = async () => {
        setPaying(true);
        try {
            await axios.put("/api/order/payment", { id: order._id });
            router.refresh();
            setOrder({ ...order, isPaid: true, paidAt: new Date().toISOString(), status: "Processing", state: { label: "Preparing", tone: "accent" } });
        } catch (error: any) {
            dispatch(pushToast({ title: "Payment didn't go through", body: error.response?.data?.message, tone: "danger" }));
        } finally {
            setPaying(false);
        }
    };

    return (
        <main>
            <Container className="max-w-5xl pb-10">
                <Breadcrumbs
                    className="pt-6"
                    items={[{ label: "Your account", href: "/profile" }, { label: "Orders", href: "/profile/orders" }, { label: `#${orderNumber(order._id)}` }]}
                />

                {placed && (
                    <div className="mt-5 flex items-start gap-3 rounded-panel bg-success-soft p-4 md:p-5">
                        <CheckCircleIcon className="h-7 w-7 shrink-0 text-success" />
                        <div>
                            <h2 className="font-display text-lg font-semibold">Thanks, your order is placed</h2>
                            <p className="text-sm text-fg-muted">
                                {order.isPaid
                                    ? `Paid with ${paymentName(order.paymentMethod)}. You'll find it under Orders whenever you need it.`
                                    : "You'll pay the courier on delivery. You'll find it under Orders whenever you need it."}
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-2 pb-6 pt-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Order #{orderNumber(order._id)}</h1>
                        <p className="mt-1 text-sm text-fg-muted">Placed {formatDate(order.createdAt)}</p>
                    </div>
                    <StatusPill state={order.state} />
                </div>

                <ol className="grid grid-cols-2 gap-3 rounded-panel border border-line bg-surface p-4 sm:grid-cols-4 md:p-5" aria-label="Order progress">
                    {steps.map((step: any, i: number) => (
                        <li key={step.label} className="flex items-start gap-2.5">
                            <span
                                className={cn(
                                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                                    step.done ? (step.tone === "danger" ? "bg-danger text-fg-inverse" : "bg-accent-ink text-fg-inverse") : "border-2 border-line-strong text-fg-subtle"
                                )}
                            >
                                {step.done ? <CheckIcon className="h-4 w-4" /> : <span className="text-xs">{i + 1}</span>}
                            </span>
                            <span>
                                <span className={cn("block text-sm font-medium", !step.done && "text-fg-muted")}>{step.label}</span>
                                {step.at && step.done && <span className="block text-xs text-fg-muted">{dateTime(step.at)}</span>}
                            </span>
                        </li>
                    ))}
                </ol>

                {!order.isPaid && order.paymentMethod !== "cash" && order.status !== "Cancelled" && (
                    <Notice tone="warning" className="mt-4" title="This order hasn't been paid">
                        It was placed before payment happened at checkout.{" "}
                        <Button size="sm" className="ml-2" onClick={pay} loading={paying}>
                            Pay {money(order.total)} now
                        </Button>
                    </Notice>
                )}

                <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
                    <section id="items" aria-labelledby="items-heading" className="scroll-mt-6 rounded-panel border border-line bg-surface">
                        <div className="flex items-center justify-between border-b border-line px-4 py-3 md:px-5">
                            <h2 id="items-heading" className="font-display text-lg font-semibold">
                                Items
                            </h2>
                            {order.status !== "Cancelled" && <BuyAgainButton lines={order.lines} label="Buy all again" />}
                        </div>
                        <ul className="divide-y divide-line">
                            {order.lines.map((line: any) => {
                                const request = line.requests[line.requests.length - 1];

                                return (
                                    <li key={line.index} className="flex gap-4 p-4 md:p-5">
                                        <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-card bg-surface-muted">
                                            {line.image && <Image src={line.image} alt="" fill sizes="80px" className="object-contain p-1.5" />}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex justify-between gap-3">
                                                {line.slug ? (
                                                    <Link href={`/product/${line.slug}`} className="line-clamp-2 font-medium hover:underline">
                                                        {line.name}
                                                    </Link>
                                                ) : (
                                                    <p className="line-clamp-2 font-medium">{line.name}</p>
                                                )}
                                                <p className="shrink-0 font-medium tabular">{money(line.price * line.qty)}</p>
                                            </div>
                                            <p className="mt-0.5 text-sm text-fg-muted">
                                                {line.qty} × {money(line.price)}
                                                {line.size && !/^one size$/i.test(line.size) && <> · Size {line.size}</>}
                                            </p>

                                            {request && (
                                                <p className="mt-2">
                                                    <Badge tone={request.status === "Refunded" ? "success" : "accent"}>
                                                        {request.status} · {request.qty} item{request.qty === 1 ? "" : "s"}
                                                    </Badge>
                                                </p>
                                            )}

                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                {line.returns.returnable ? (
                                                    <Button size="sm" variant="outline" onClick={() => setReturning(line.index)}>
                                                        Return · {line.returns.daysLeft} day{line.returns.daysLeft === 1 ? "" : "s"} left
                                                    </Button>
                                                ) : (
                                                    line.returns.reason &&
                                                    !request && <span className="text-xs text-fg-subtle">{line.returns.reason}</span>
                                                )}
                                                {line.slug && order.isPaid && (
                                                    <Link href={`/product/${line.slug}#reviews`} className="text-sm text-link">
                                                        Write a review
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    <div className="space-y-4">
                        <Card>
                            <h2 className="font-display text-lg font-semibold">Payment</h2>
                            <dl className="mt-3 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-fg-muted">Items</dt>
                                    <dd className="tabular">{money(order.totalBeforeDiscount ?? order.total)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-fg-muted">Delivery</dt>
                                    <dd className="tabular">{order.shippingPrice > 0 ? money(order.shippingPrice) : "Free"}</dd>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-success">
                                        <dt>{order.couponApplied ? `Coupon ${order.couponApplied}` : "Discount"}</dt>
                                        <dd className="tabular">−{money(discount)}</dd>
                                    </div>
                                )}
                                {order.giftCardApplied > 0 && (
                                    <div className="flex justify-between text-success">
                                        <dt>Gift card</dt>
                                        <dd className="tabular">−{money(order.giftCardApplied)}</dd>
                                    </div>
                                )}
                                <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
                                    <dt>Total</dt>
                                    <dd className="tabular">{money(order.total)}</dd>
                                </div>
                            </dl>
                            <p className="mt-3 text-sm text-fg-muted">
                                {paymentName(order.paymentMethod)} · {order.isPaid ? `paid ${formatDate(order.paidAt)}` : order.paymentMethod === "cash" ? "due on delivery" : "unpaid"}
                            </p>
                        </Card>

                        <Card>
                            <h2 className="font-display text-lg font-semibold">Delivery address</h2>
                            <address className="mt-3 text-sm not-italic text-fg-muted">
                                <span className="font-medium text-fg">
                                    {address.firstName} {address.lastName}
                                </span>
                                {addressLines(address).map((lineText: string) => (
                                    <span key={lineText} className="block">
                                        {lineText}
                                    </span>
                                ))}
                                {address.phoneNumber && <span className="mt-1 block">{address.phoneNumber}</span>}
                            </address>
                        </Card>

                        <p className="px-1 text-sm text-fg-muted">
                            Something wrong?{" "}
                            <Link href="/customer-service/your-orders" className="text-link">
                                Help with orders
                            </Link>
                        </p>
                    </div>
                </div>
            </Container>

            <ReturnSheet
                order={order}
                line={returning}
                onClose={() => setReturning(null)}
                onSubmitted={(data: any) => {
                    const index = returning as number;
                    setReturning(null);
                    setOrder({
                        ...order,
                        lines: order.lines.map((line: any) =>
                            line.index === index
                                ? {
                                      ...line,
                                      requests: [...line.requests, data.returnRequest],
                                      returns: {
                                          ...line.returns,
                                          remaining: line.returns.remaining - data.returnRequest.qty,
                                          returnable: line.returns.remaining - data.returnRequest.qty > 0,
                                      },
                                  }
                                : line
                        ),
                    });
                    dispatch(pushToast({ title: "Return requested", body: "Approval usually lands within a day. Track it under Returns.", secondary: { label: "Returns", href: "/profile/returns" } }));
                }}
            />
        </main>
    );
};

export default OrderDetail;
