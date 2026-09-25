"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

import { useAppDispatch } from "@/redux/hooks";
import { pushToast } from "@/redux/slices/ToastSlice";
import Button from "@/components/ui/Button";
import { EmptyState, SectionHeader } from "@/components/ui/Layout";
import { cn } from "@/components/ui/cn";
import { formatDate, orderNumber, returnStatuses, statusHint } from "@/lib/returns";
import ReturnSheet from "./ReturnSheet";

// Where each return is (requested → approved → refunded) and what can still
// go back, in one place. Nothing here is a separate "centre": both lists come
// from the order documents.
const ReturnsView = ({ requests, returnable }: any) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [active, setActive] = useState<{ order: any; line: number } | null>(null);

    return (
        <div className="space-y-10">
            <section>
                <SectionHeader title="Your returns" description="Refunds are issued once a return is approved." />
                {requests.length ? (
                    <ul className="space-y-3">
                        {requests.map((request: any, i: number) => {
                            const step = returnStatuses.indexOf(request.status);

                            return (
                                <li key={request._id || `${request.orderId}-${request.line}-${i}`} className="rounded-panel border border-line bg-surface p-4 md:p-5">
                                    <div className="flex gap-4">
                                        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-control bg-surface-muted">
                                            {request.image && <Image src={request.image} alt="" fill sizes="64px" className="object-contain p-1" />}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="line-clamp-1 font-medium">{request.name}</p>
                                            <p className="text-sm text-fg-muted">
                                                {request.qty} item{request.qty === 1 ? "" : "s"} · {request.reason} · requested {formatDate(request.requestedAt)}
                                            </p>
                                            <p className="text-sm text-fg-muted">
                                                Refund to {String(request.refundTo).replace(/^Amazon/, "Markaz").toLowerCase()} ·{" "}
                                                <Link href={`/order/${request.orderId}`} className="text-link">
                                                    Order #{orderNumber(request.orderId)}
                                                </Link>
                                            </p>
                                        </div>
                                    </div>

                                    <ol className="mt-4 grid grid-cols-3 gap-2" aria-label="Return progress">
                                        {returnStatuses.map((status, n) => (
                                            <li key={status}>
                                                <span className={cn("block h-1.5 rounded-full", n <= step ? "bg-accent-ink" : "bg-surface-muted")} />
                                                <span className={cn("mt-1.5 block text-xs", n <= step ? "font-medium text-fg" : "text-fg-subtle")}>
                                                    {{ "Return requested": "Requested", "Return approved": "Approved" }[status] || status}
                                                </span>
                                            </li>
                                        ))}
                                    </ol>
                                    <p className="mt-2 text-sm text-fg-muted">{statusHint(request.status)}</p>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <EmptyState icon={ArrowUturnLeftIcon} title="No returns yet" description="Returns you request show up here with their progress." />
                )}
            </section>

            <section>
                <SectionHeader title="You can still return" description="Each item's window is the one its product page promised." />
                {returnable.length ? (
                    <ul className="divide-y divide-line rounded-panel border border-line bg-surface">
                        {returnable.flatMap((order: any) =>
                            order.lines.map((line: any) => (
                                <li key={`${order._id}-${line.index}`} className="flex items-center gap-4 p-4">
                                    <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-control bg-surface-muted">
                                        {line.image && <Image src={line.image} alt="" fill sizes="56px" className="object-contain p-1" />}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="line-clamp-1 text-sm font-medium">{line.name}</p>
                                        <p className="text-xs text-fg-muted">
                                            Order #{orderNumber(order._id)} · return by {formatDate(line.returns.deadline)}
                                        </p>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => setActive({ order, line: line.index })}>
                                        Return
                                    </Button>
                                </li>
                            ))
                        )}
                    </ul>
                ) : (
                    <p className="rounded-panel border border-dashed border-line-strong bg-surface p-6 text-center text-sm text-fg-muted">
                        Nothing is inside a return window right now.
                    </p>
                )}
            </section>

            {active && (
                <ReturnSheet
                    order={active.order}
                    line={active.order.lines.findIndex((line: any) => line.index === active.line)}
                    onClose={() => setActive(null)}
                    onSubmitted={() => {
                        setActive(null);
                        dispatch(pushToast({ title: "Return requested", body: "Approval usually lands within a day." }));
                        router.refresh();
                    }}
                />
            )}
        </div>
    );
};

export default ReturnsView;
