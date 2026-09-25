"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Sheet from "@/components/ui/Sheet";
import { Select } from "@/components/ui/Field";
import { EmptyState, Notice } from "@/components/ui/Layout";
import Price from "@/components/ui/Price";
import useAddToCart from "@/components/cart/useAddToCart";
import { WEEK_OPTIONS, dueIn, dueLabel } from "@/lib/autoReorder";

// Repeats are reminders over things this account has actually bought. Nothing
// is ordered automatically, and the panel says so where the dates are, not in a
// footnote.
const AutoReorder = ({ schedules: initial, candidates }: any) => {
    const [schedules, setSchedules] = useState<any[]>(initial || []);
    const [adding, setAdding] = useState(false);
    const [pick, setPick] = useState<any>(null);
    const [weeks, setWeeks] = useState(4);
    const [busy, setBusy] = useState("");
    const [error, setError] = useState("");
    const { add, pending } = useAddToCart();

    const send = async (key: string, request: () => Promise<any>) => {
        setError("");
        setBusy(key);

        try {
            const { data } = await request();
            setSchedules(data.schedules);
            setAdding(false);
            setPick(null);
        } catch (err: any) {
            setError(err.response?.data?.message || "That didn't work.");
        } finally {
            setBusy("");
        }
    };

    const scheduled = new Set(schedules.map((entry: any) => `${entry.productId}-${entry.size}`));
    const available = candidates.filter((item: any) => item.rebuy && !scheduled.has(`${item.productId}-${item.size}`));

    return (
        <>
            {error && <Notice tone="danger" className="mb-4">{error}</Notice>}

            {schedules.length === 0 ? (
                <EmptyState
                    icon={ArrowPathIcon}
                    title="Nothing repeats yet"
                    description="Pick something you buy regularly and Markaz will remind you when it's about due. It never orders for you — the reminder is the whole feature."
                    action={
                        available.length ? (
                            <Button onClick={() => setAdding(true)}>Set up a repeat</Button>
                        ) : (
                            <Button href="/buy-again" variant="outline">
                                Things you have bought
                            </Button>
                        )
                    }
                />
            ) : (
                <>
                    <ul className="grid gap-4 md:grid-cols-2">
                        {schedules.map((entry: any) => {
                            const due = dueIn(entry.nextAt) <= 0;

                            return (
                                <li key={entry._id} className="flex gap-4 rounded-card border border-line bg-surface p-4">
                                    <Link href={`/product/${entry.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-control bg-surface-muted">
                                        {entry.image && <Image src={entry.image} alt="" fill sizes="80px" className="object-contain p-1.5" />}
                                    </Link>

                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <div className="flex items-start justify-between gap-2">
                                            <Link href={`/product/${entry.slug}`} className="line-clamp-2 text-sm font-medium text-fg hover:underline underline-offset-2">
                                                {entry.name}
                                            </Link>
                                            {due && <Badge tone="accent">Due</Badge>}
                                        </div>

                                        <p className="mt-0.5 text-xs text-fg-muted">
                                            {dueLabel(entry.nextAt)}
                                            {entry.size && <> · size {entry.size}</>}
                                        </p>

                                        {entry.price !== null && <Price value={entry.price} listPrice={entry.listPrice} size="sm" showSaving={false} className="mt-1" />}

                                        <div className="mt-3 max-w-52">
                                            <Select
                                                aria-label={`How often to repeat ${entry.name}`}
                                                value={entry.everyWeeks}
                                                onChange={(event: any) =>
                                                    send(entry._id, () => axios.patch("/api/user/auto-reorder", { id: entry._id, everyWeeks: Number(event.target.value) }))
                                                }
                                            >
                                                {WEEK_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </Select>
                                        </div>

                                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3 text-sm">
                                            {entry.rebuy ? (
                                                <button
                                                    type="button"
                                                    onClick={() => add(entry.rebuy)}
                                                    disabled={pending.startsWith(`${entry.productId}_`)}
                                                    className="text-link disabled:opacity-50"
                                                >
                                                    Add to cart
                                                </button>
                                            ) : (
                                                <span className="text-xs text-fg-muted">Out of stock right now</span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => send(entry._id, () => axios.patch("/api/user/auto-reorder", { id: entry._id, snooze: true }))}
                                                disabled={busy === entry._id}
                                                className="text-link disabled:opacity-50"
                                            >
                                                Got it covered
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => send(entry._id, () => axios.delete("/api/user/auto-reorder", { data: { id: entry._id } }))}
                                                disabled={busy === entry._id}
                                                className="text-link disabled:opacity-50"
                                            >
                                                Stop
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    {available.length > 0 && (
                        <Button variant="outline" className="mt-5" onClick={() => setAdding(true)}>
                            Set up another
                        </Button>
                    )}
                </>
            )}

            <Sheet
                open={adding}
                onClose={() => setAdding(false)}
                side="right"
                title="Set up a repeat"
                description="Only things you have bought before, because a repeat of something you have never had is a guess."
            >
                {available.length === 0 ? (
                    <p className="text-sm text-fg-muted">Everything you have bought already repeats.</p>
                ) : (
                    <>
                        <ul className="divide-y divide-line border-y border-line">
                            {available.map((item: any) => (
                                <li key={item.key}>
                                    <button
                                        type="button"
                                        onClick={() => setPick(item)}
                                        aria-pressed={pick?.key === item.key}
                                        className={`flex w-full items-center gap-3 py-3 text-left cursor-pointer ${pick?.key === item.key ? "text-accent-deep" : ""}`}
                                    >
                                        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-control bg-surface-muted">
                                            {item.image && <Image src={item.image} alt="" fill sizes="48px" className="object-contain p-1" />}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-medium">{item.name}</span>
                                            <span className="block text-xs text-fg-muted">
                                                {item.size && <>size {item.size} · </>}bought {item.times} time{item.times === 1 ? "" : "s"}
                                            </span>
                                        </span>
                                        {pick?.key === item.key && <span className="text-sm">Chosen</span>}
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-5">
                            <label htmlFor="repeat-every" className="text-sm font-medium text-fg">
                                How often
                            </label>
                            <Select
                                id="repeat-every"
                                value={weeks}
                                onChange={(event: any) => setWeeks(Number(event.target.value))}
                                className="mt-1.5"
                            >
                                {WEEK_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <Button
                            className="mt-5"
                            disabled={!pick}
                            loading={busy === "add"}
                            onClick={() =>
                                send("add", () =>
                                    axios.post("/api/user/auto-reorder", {
                                        product_id: pick.productId,
                                        style: pick.rebuy.style,
                                        size: pick.size,
                                        everyWeeks: weeks,
                                    })
                                )
                            }
                        >
                            Start repeating
                        </Button>
                    </>
                )}
            </Sheet>
        </>
    );
};

export default AutoReorder;
