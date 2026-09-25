"use client";

import { useState } from "react";

import { Badge, Panel, statusTone } from "@/components/admin/ui";
import StatusControl from "./StatusControl";

// The detail page's status box. Like a list row, it keeps a local copy so the
// badge changes immediately; router.refresh() then brings the timeline along.
const OrderStatusPanel = ({ order: initial }: any) => {
    const [order, setOrder] = useState(initial);

    return (
        <Panel title="Status">
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge tone={statusTone[order.status]}>{order.status}</Badge>
                <Badge tone={order.isPaid ? "green" : "amber"}>{order.isPaid ? "Paid" : "Unpaid"}</Badge>
            </div>
            <StatusControl
                order={order}
                onUpdated={(updated: any) => setOrder({ ...order, status: updated.status, isPaid: updated.isPaid })}
            />
            {!order.isPaid && !["Cancelled", "Completed"].includes(order.status) && (
                <p className="text-xs text-fg-subtle mt-3">
                    Unpaid orders can only be cancelled: stock is taken at payment, so there is nothing to ship yet.
                </p>
            )}
        </Panel>
    );
};

export default OrderStatusPanel;
