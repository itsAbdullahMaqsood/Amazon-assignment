"use client";

import Form from "next/form";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { ORDER_STATUSES } from "@/lib/adminOrders";
import { btn, field, label } from "@/components/admin/ui";

// A plain GET form: filters land in the URL, so the server renders the result
// and the link can be shared. Changing a select submits straight away; the
// page number is not part of the form, so any new filter starts at page 1.
const OrderFilters = ({ q, status, paid }: any) => {
    const submitOnChange = (e: any) => e.currentTarget.form?.requestSubmit();

    return (
        <Form
            action="/admin/dashboard/orders"
            role="search"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_12rem_10rem_auto] gap-3 items-end mb-4"
        >
            <div className="sm:col-span-2 lg:col-span-1">
                <label htmlFor="orders-q" className={label}>
                    Search
                </label>
                <div className="relative">
                    <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        id="orders-q"
                        name="q"
                        type="search"
                        defaultValue={q}
                        placeholder="Order ID or customer email"
                        className={`${field} pl-9`}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="orders-status" className={label}>
                    Status
                </label>
                <select id="orders-status" name="status" defaultValue={status} onChange={submitOnChange} className={field}>
                    <option value="">All statuses</option>
                    {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="orders-paid" className={label}>
                    Payment
                </label>
                <select id="orders-paid" name="paid" defaultValue={paid} onChange={submitOnChange} className={field}>
                    <option value="">All payments</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                </select>
            </div>

            <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
                <button type="submit" className={btn.primary}>
                    Apply
                </button>
                {(q || status || paid) && (
                    <Link href="/admin/dashboard/orders" className={btn.secondary}>
                        Clear
                    </Link>
                )}
            </div>
        </Form>
    );
};

export default OrderFilters;
