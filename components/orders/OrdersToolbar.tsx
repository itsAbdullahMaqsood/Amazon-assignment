"use client";

import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { timeRanges } from "@/lib/orders";

// Search and time range for the orders list, as a GET form: it works without
// JavaScript, and the select submits itself when it can.
const OrdersToolbar = ({ tab, time, search }: any) => {
    const router = useRouter();

    return (
        <form action="/profile/orders" className="flex flex-col gap-2 sm:flex-row">
            {tab && <input type="hidden" name="tab" value={tab} />}
            <label className="relative flex-1">
                <span className="sr-only">Search your orders</span>
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
                <input
                    type="search"
                    name="search"
                    defaultValue={search}
                    placeholder="Search by product name"
                    className="h-10 w-full rounded-control border border-line-strong bg-surface pl-9 pr-3 text-sm outline-none focus:border-accent-ink"
                />
            </label>
            <label>
                <span className="sr-only">Orders placed in</span>
                <select
                    name="time"
                    defaultValue={time}
                    onChange={(e) => {
                        const params = new URLSearchParams({ ...(tab && { tab }), ...(search && { search }), ...(e.target.value && { time: e.target.value }) });
                        router.push(`/profile/orders?${params.toString()}`);
                    }}
                    className="h-10 w-full cursor-pointer rounded-control border border-line-strong bg-surface pl-3 pr-8 text-sm outline-none focus:border-accent-ink sm:w-44"
                >
                    <option value="">All time</option>
                    {timeRanges().map((range) => (
                        <option key={range.value} value={range.value}>
                            {/^\d{4}$/.test(range.value) ? range.label : range.label.charAt(0).toUpperCase() + range.label.slice(1)}
                        </option>
                    ))}
                </select>
            </label>
        </form>
    );
};

export default OrdersToolbar;
