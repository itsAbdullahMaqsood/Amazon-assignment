"use client";

import { useRouter } from "next/navigation";

import { timeRanges } from "@/lib/orders";

// The "orders placed in" dropdown. Changing it rewrites the URL, so the range
// survives a reload and can be linked to.
const TimeFilter = ({ value, params }: any) => {
    const router = useRouter();

    const changeHandler = (e: any) => {
        const query = new URLSearchParams(params);
        query.set("time", e.target.value);

        router.push(`/profile/orders?${query.toString()}`);
    };

    return (
        <>
            <label htmlFor="order-range" className="sr-only">
                Orders placed in
            </label>

            <select
                id="order-range"
                value={value}
                onChange={changeHandler}
                className="border border-slate-400 rounded-lg bg-[#F0F2F2] px-3 py-1.5 shadow-sm outline-none focus:border-[#007185] cursor-pointer"
            >
                {timeRanges().map((range) => (
                    <option key={range.value} value={range.value}>
                        {range.label}
                    </option>
                ))}
            </select>
        </>
    );
};

export default TimeFilter;
