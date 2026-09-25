import { Suspense } from "react";
import mongoose from "mongoose";

import connectDb from "@/lib/db";
import { requireAdminPage } from "@/lib/guard";
import { ORDER_STATUSES, formatDate } from "@/lib/adminOrders";
import { escapeRegex } from "@/utils/regex";
import Order from "@/models/Order";
import User from "@/models/User";
import { EmptyState, PageHeader, table } from "@/components/admin/ui";
import OrderFilters from "@/components/admin/orders/OrderFilters";
import OrderRow from "@/components/admin/orders/OrderRow";
import OrdersPagination from "@/components/admin/orders/OrdersPagination";
import OrdersTableSkeleton from "@/components/admin/orders/OrdersTableSkeleton";

export const metadata = { title: "Orders" };

const PER_PAGE = 20;

const one = (value: any) => (Array.isArray(value) ? value[0] : value) || "";

// Turns the URL query into a Mongo filter. Every value is checked against a
// known list or escaped, since it arrives straight from the address bar.
const buildFilter = async ({ q, status, paid }: any) => {
    const filter: any = {};

    if (ORDER_STATUSES.includes(status)) {
        filter.status = status;
    }

    if (paid === "paid") {
        filter.isPaid = true;
    } else if (paid === "unpaid") {
        filter.isPaid = false;
    }

    const term = q.trim().replace(/^#/, "");

    if (term) {
        const or: any[] = [];

        if (mongoose.isValidObjectId(term) && term.length === 24) {
            or.push({ _id: term });
        } else if (/^[0-9a-f]{4,23}$/i.test(term)) {
            // The table shows the last 8 characters, so a pasted short id matches
            // on the id's tail.
            or.push({
                $expr: {
                    $regexMatch: {
                        input: { $toString: "$_id" },
                        regex: `${escapeRegex(term)}$`,
                        options: "i",
                    },
                },
            });
        }

        const users = await User.find({ email: { $regex: escapeRegex(term), $options: "i" } })
            .select("_id")
            .limit(500)
            .lean();

        if (users.length) {
            or.push({ user: { $in: users.map((u: any) => u._id) } });
        }

        // Nothing could match: an impossible condition keeps the count honest.
        filter.$or = or.length ? or : [{ _id: null }];
    }

    return filter;
};

// The query runs inside a Suspense boundary keyed by the filters, so the header
// and filters paint at once and the skeleton shows on every filter change. This
// is deliberately not a route-level loading.tsx: that boundary would also wrap
// orders/[id], start streaming a 200 before the order lookup, and turn the
// detail page's notFound() into a soft 404.
const OrdersTable = async ({ q, status, paid, pageParam }: any) => {
    await connectDb();

    const filter = await buildFilter({ q, status, paid });
    const total = await Order.countDocuments(filter);
    const pages = Math.max(1, Math.ceil(total / PER_PAGE));
    const page = Math.min(pages, Math.max(1, parseInt(pageParam, 10) || 1));

    const orders: any[] = await Order.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * PER_PAGE)
        .limit(PER_PAGE)
        .select("user products.qty total isPaid status createdAt updatedAt")
        .populate({ path: "user", model: User, select: "name email" })
        .lean();

    const rows = orders.map((order) => ({
        ...JSON.parse(JSON.stringify(order)),
        placed: formatDate(order.createdAt),
    }));

    const from = total ? (page - 1) * PER_PAGE + 1 : 0;
    const to = Math.min(total, page * PER_PAGE);
    const filtered = Boolean(q || status || paid);

    return (
        <>
            <p className="text-sm text-fg-muted mb-3" aria-live="polite">
                {total
                    ? `Showing ${from}–${to} of ${total} order${total === 1 ? "" : "s"}`
                    : "No orders to show"}
            </p>

            <div className={table.wrap}>
                {rows.length ? (
                    <table className={table.table}>
                        <caption className="sr-only">Orders</caption>
                        <thead className={table.head}>
                            <tr>
                                <th scope="col" className={table.th}>Order</th>
                                <th scope="col" className={table.th}>Date</th>
                                <th scope="col" className={table.th}>Customer</th>
                                <th scope="col" className={`${table.th} text-right`}>Items</th>
                                <th scope="col" className={`${table.th} text-right`}>Total</th>
                                <th scope="col" className={table.th}>Payment</th>
                                <th scope="col" className={table.th}>Status</th>
                                <th scope="col" className={table.th}>Change status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((order) => (
                                <OrderRow key={`${order._id}-${order.updatedAt}`} order={order} />
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <EmptyState title={filtered ? "No orders match these filters" : "No orders yet"}>
                        {filtered
                            ? "Try a different status or payment filter, or search by another order ID or email."
                            : "Orders appear here as soon as a customer checks out."}
                    </EmptyState>
                )}
            </div>

            <OrdersPagination page={page} count={pages} />
        </>
    );
};

const Page = async ({ searchParams }: any) => {
    const params = await searchParams;
    const q = one(params.q);
    const status = ORDER_STATUSES.includes(one(params.status)) ? one(params.status) : "";
    const paid = ["paid", "unpaid"].includes(one(params.paid)) ? one(params.paid) : "";
    const pageParam = one(params.page);

    await requireAdminPage("/admin/dashboard/orders");

    return (
        <>
            <PageHeader title="Orders" description="Every order in the store, newest first." />

            <OrderFilters q={q} status={status} paid={paid} />

            <Suspense key={`${q}|${status}|${paid}|${pageParam}`} fallback={<OrdersTableSkeleton />}>
                <OrdersTable q={q} status={status} paid={paid} pageParam={pageParam} />
            </Suspense>
        </>
    );
};

export default Page;
