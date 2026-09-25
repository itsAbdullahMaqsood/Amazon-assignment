"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// Searches the signed-in user's own orders. `params` carries the tab and the
// time range along, so searching does not throw away the current view.
const OrdersSearch = ({ initial = "", params = "" }: any) => {
    const router = useRouter();
    const [query, setQuery] = useState<string>(initial);

    const submitHandler = (e: any) => {
        e.preventDefault();

        const next = new URLSearchParams(params);
        const term = query.trim();

        if (term) {
            next.set("search", term);
        } else {
            next.delete("search");
        }

        const search = next.toString();
        router.push(search ? `/profile/orders?${search}` : "/profile/orders");
    };

    return (
        <form onSubmit={submitHandler} role="search" className="flex items-center gap-3">
            <label htmlFor="order-search" className="sr-only">
                Search all orders
            </label>

            <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                    id="order-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search all orders"
                    className="w-[260px] md:w-[360px] border border-slate-400 rounded-lg py-2.5 pl-10 pr-3 outline-none focus:border-accent-ink"
                />
            </div>

            <button
                type="submit"
                className="bg-ink-800 text-white rounded-full px-5 py-2.5 font-semibold hover:bg-black transition cursor-pointer"
            >
                Search Orders
            </button>
        </form>
    );
};

export default OrdersSearch;
