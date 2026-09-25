"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";

import Price from "@/components/shared/Price";
import { formatDate } from "@/lib/localStore";
import { frequencies, scheduleItem, subscribeSaveStore, unscheduleItem } from "@/lib/prime";

// The candidates are real: every product the signed-in shopper has actually
// ordered. Only the schedule is simulated, and it lives in this browser.
const SubscribeSave = ({ items }: any) => {
    const scheduled: any = useSyncExternalStore(
        subscribeSaveStore.subscribe,
        subscribeSaveStore.getSnapshot,
        subscribeSaveStore.getServerSnapshot
    );

    const [draft, setDraft] = useState<any>({});

    if (!items.length) {
        return (
            <div className="border border-slate-300 rounded-lg bg-white p-8 text-center">
                <p className="font-semibold">Nothing is eligible for Subscribe &amp; Save yet.</p>
                <p className="mt-2 text-sm text-slate-600">
                    Eligible items are the ones you have ordered before, and your order history is
                    empty.
                </p>
                <Link
                    href="/browse"
                    className="inline-block mt-5 px-6 py-2 rounded-full bg-accent text-ink-900"
                >
                    Start shopping
                </Link>
            </div>
        );
    }

    const changeHandler = (id: string, value: string) => {
        if (scheduled?.[id]) {
            scheduleItem(id, value);
        } else {
            setDraft({ ...draft, [id]: value });
        }
    };

    return (
        <div className="space-y-4">
            {items.map((item: any) => {
                const active = scheduled?.[item.id];
                const value = active || draft[item.id] || "1";

                return (
                    <article
                        key={item.id}
                        className="border border-slate-300 rounded-lg bg-white p-4 flex flex-col sm:flex-row gap-4"
                    >
                        <div className="relative w-[90px] h-[90px] shrink-0 self-start">
                            <Image
                                src={item.image || "/assets/images/no-image.png"}
                                alt={item.name}
                                fill
                                sizes="90px"
                                className="object-contain"
                            />
                        </div>

                        <div className="grow">
                            {item.slug ? (
                                <Link
                                    href={`/product/${item.slug}`}
                                    className="text-accent-ink hover:text-accent-deep hover:underline font-medium line-clamp-2"
                                >
                                    {item.name}
                                </Link>
                            ) : (
                                <p className="font-medium line-clamp-2">{item.name}</p>
                            )}

                            <Price value={item.price} size="sm" className="mt-1" />

                            <p className="text-sm text-slate-600 mt-1">
                                Ordered {item.timesOrdered} time{item.timesOrdered === 1 ? "" : "s"}
                                {item.lastOrderedAt ? ` · last on ${formatDate(item.lastOrderedAt)}` : ""}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                <label htmlFor={`freq-${item.id}`} className="text-sm">
                                    Delivery frequency
                                </label>
                                <select
                                    id={`freq-${item.id}`}
                                    value={value}
                                    onChange={(event) => changeHandler(item.id, event.target.value)}
                                    className="rounded border border-slate-400 p-2 text-sm cursor-pointer"
                                >
                                    {frequencies.map((frequency) => (
                                        <option key={frequency.value} value={frequency.value}>
                                            {frequency.label}
                                        </option>
                                    ))}
                                </select>

                                {active ? (
                                    <button
                                        type="button"
                                        onClick={() => unscheduleItem(item.id)}
                                        className="px-5 py-2 rounded-full text-sm font-semibold border border-slate-400 cursor-pointer"
                                    >
                                        Cancel subscription
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => scheduleItem(item.id, value)}
                                        className="px-5 py-2 rounded-full text-sm font-semibold bg-accent text-ink-900 cursor-pointer"
                                    >
                                        Set up subscription
                                    </button>
                                )}
                            </div>

                            {active && (
                                <p className="mt-2 text-sm text-success font-semibold">
                                    Subscribed —{" "}
                                    {frequencies
                                        .find((frequency) => frequency.value === active)
                                        ?.label.toLowerCase()}
                                </p>
                            )}
                        </div>
                    </article>
                );
            })}

            <p className="text-xs text-slate-600">
                Subscribe &amp; Save is simulated in this build: a schedule is stored in your browser
                and does not create orders or change cart pricing.
            </p>
        </div>
    );
};

export default SubscribeSave;
