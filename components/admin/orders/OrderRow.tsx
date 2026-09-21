"use client";

import { useState } from "react";
import Link from "next/link";

import Price from "@/components/shared/Price";
import { Badge, statusTone, table } from "@/components/admin/ui";
import { itemCount, shortId } from "@/lib/adminOrders";
import StatusControl from "./StatusControl";

// Holds its own copy of the order so a status change shows at once; the page
// keys each row by updatedAt, so fresher server data after router.refresh()
// remounts it rather than being shadowed by this state.
const OrderRow = ({ order: initial }: any) => {
    const [order, setOrder] = useState(initial);
    const merge = (updated: any) => setOrder({ ...order, status: updated.status, isPaid: updated.isPaid });

    return (
        <tr className={table.row}>
            <td className={table.td}>
                <Link
                    href={`/admin/dashboard/orders/${order._id}`}
                    title={order._id}
                    className="font-mono text-[13px] text-[#007185] hover:text-[#C7511F] hover:underline rounded outline-none focus-visible:ring-2 focus-visible:ring-[#007185]"
                >
                    {shortId(order._id)}
                </Link>
            </td>
            <td className={`${table.td} whitespace-nowrap text-slate-700`}>{order.placed}</td>
            <td className={`${table.td} max-w-56`}>
                {order.user ? (
                    <>
                        <p className="font-medium text-[#0F1111] truncate">{order.user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{order.user.email}</p>
                    </>
                ) : (
                    <span className="text-xs text-slate-500">Deleted account</span>
                )}
            </td>
            <td className={`${table.td} text-right tabular-nums`}>{itemCount(order)}</td>
            <td className={`${table.td} text-right whitespace-nowrap`}>
                <Price value={order.total} size="sm" />
            </td>
            <td className={table.td}>
                <Badge tone={order.isPaid ? "green" : "amber"}>{order.isPaid ? "Paid" : "Unpaid"}</Badge>
            </td>
            <td className={table.td}>
                <Badge tone={statusTone[order.status]}>{order.status}</Badge>
            </td>
            <td className={`${table.td} whitespace-nowrap`}>
                <StatusControl order={order} onUpdated={merge} compact />
            </td>
        </tr>
    );
};

export default OrderRow;
