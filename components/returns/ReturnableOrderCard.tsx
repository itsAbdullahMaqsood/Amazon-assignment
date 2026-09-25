"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import Price from "@/components/shared/Price";
import { formatDate, orderNumber, qtyReturnable, returnDeadline } from "@/lib/returns";
import ReturnModal from "./ReturnModal";

// `daysLeft` is counted on the server: deriving it here from Date.now() would
// differ between the server render and hydration on the day a window closes.
const ReturnableOrderCard = ({ order, daysLeft }: any) => {
    const router = useRouter();
    const [openLine, setOpenLine] = useState<number>(-1);
    const [message, setMessage] = useState<string>("");

    const submittedHandler = (text: string) => {
        setOpenLine(-1);
        setMessage(text);
        router.refresh();
    };

    return (
        <article className="border border-slate-300 rounded-lg overflow-hidden bg-white">
            <div className="bg-surface-muted border-b border-slate-300 px-4 py-3 flex flex-wrap gap-8 text-xs text-slate-700">
                <div>
                    <p className="uppercase">Order placed</p>
                    <p className="text-sm text-black">{formatDate(order.createdAt)}</p>
                </div>

                <div>
                    <p className="uppercase">Total</p>
                    <p className="text-sm text-black">${Number(order.total).toFixed(2)}</p>
                </div>

                <div>
                    <p className="uppercase">Ship to</p>
                    <p className="text-sm text-accent-ink">
                        {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                    </p>
                </div>

                <div className="md:ml-auto md:text-right">
                    <p className="uppercase">Order # {orderNumber(order._id)}</p>
                    <p className="text-sm">
                        <Link
                            href={`/order/${order._id}`}
                            className="text-accent-ink hover:text-accent-deep hover:underline"
                        >
                            View order details
                        </Link>
                    </p>
                </div>
            </div>

            <div className="p-4">
                <p className="text-sm">
                    <span className="font-bold">
                        {daysLeft > 0
                            ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left to return`
                            : "Last day to return"}
                    </span>{" "}
                    <span className="text-slate-600">
                        · Window closes {formatDate(returnDeadline(order))}
                    </span>
                </p>

                {message && (
                    <p role="status" className="text-sm text-success mt-2">
                        {message}
                    </p>
                )}

                <div className="mt-4 space-y-6">
                    {order.products.map((item: any, i: number) => {
                        const remaining = qtyReturnable(order, i);
                        const href = item.product?.slug ? `/product/${item.product.slug}` : "/browse";

                        return (
                            <div key={i} className="flex flex-col md:flex-row gap-4">
                                <Link href={href} className="shrink-0">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        width={96}
                                        height={96}
                                        className="rounded object-contain w-24 h-24 bg-white"
                                    />
                                </Link>

                                <div className="grow min-w-0">
                                    <Link
                                        href={href}
                                        className="text-sm text-accent-ink hover:text-accent-deep hover:underline line-clamp-2"
                                    >
                                        {item.name}
                                    </Link>

                                    <p className="text-xs text-slate-600 mt-1">
                                        {[
                                            item.color?.color && `Colour: ${item.color.color}`,
                                            item.size && `Size: ${item.size}`,
                                            `Qty: ${item.qty}`,
                                        ]
                                            .filter(Boolean)
                                            .join(" · ")}
                                    </p>

                                    <Price value={item.price} size="sm" className="mt-1" />
                                </div>

                                <div className="w-full md:w-[240px] shrink-0">
                                    {remaining > 0 ? (
                                        <button
                                            onClick={() => setOpenLine(i)}
                                            className="w-full px-4 py-1.5 rounded-full text-sm border border-slate-400 bg-white hover:bg-slate-100 shadow-sm cursor-pointer"
                                        >
                                            Return or replace items
                                        </button>
                                    ) : (
                                        <p className="text-xs text-slate-600 md:text-right">
                                            Return already requested for this item.
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {openLine >= 0 && (
                <ReturnModal
                    order={order}
                    line={openLine}
                    onClose={() => setOpenLine(-1)}
                    onSubmitted={submittedHandler}
                />
            )}
        </article>
    );
};

export default ReturnableOrderCard;
