// Order status rules shared by the admin API (which enforces them) and the admin
// status control (which only offers what the API would accept). Kept free of
// server imports so client components can use it too.

export const ORDER_STATUSES = ["Not Processed", "Processing", "Dispatched", "Completed", "Cancelled"];

// The fulfilment path, in order. Cancelled sits outside it: it can be reached
// from any non-terminal step but leads nowhere.
export const FLOW = ["Not Processed", "Processing", "Dispatched", "Completed"];

export const TERMINAL = ["Completed", "Cancelled"];

// Every status an admin may move this order to, in display order. Forward moves
// may skip steps; backwards moves and moves out of a terminal status never
// appear. Stock is only taken when an order is paid, so an unpaid order can be
// cancelled but not fulfilled: shipping it would send out goods the inventory
// never gave up.
export const allowedNext = (order: any) => {
    const status = order?.status || "Not Processed";

    if (TERMINAL.includes(status)) {
        return [];
    }

    const forward = order?.isPaid ? FLOW.slice(FLOW.indexOf(status) + 1) : [];

    return [...forward, "Cancelled"];
};

// Why a move is refused, or null when it is allowed. The API sends this message
// back as-is, so it is written for the admin reading it.
export const refuseReason = (order: any, next: string) => {
    if (!next) {
        return "Choose the status to move this order to.";
    }

    if (!ORDER_STATUSES.includes(next)) {
        return `"${next}" is not an order status.`;
    }

    if (next === order.status) {
        return `This order is already ${next}.`;
    }

    if (TERMINAL.includes(order.status)) {
        return `This order is ${order.status}, which is final; its status can no longer change.`;
    }

    // Any non-terminal order may be cancelled.
    if (next === "Cancelled") {
        return null;
    }

    if (!order.isPaid) {
        return "This order has not been paid, so it cannot be fulfilled. It can only be cancelled.";
    }

    if (FLOW.indexOf(next) < FLOW.indexOf(order.status)) {
        return `An order cannot move back from ${order.status} to ${next}.`;
    }

    return null;
};

// The table shows the tail of the id; search accepts that tail as well.
export const shortId = (id: any) => String(id).slice(-8).toUpperCase();

export const itemCount = (order: any) =>
    (order?.products || []).reduce((sum: number, line: any) => sum + (Number(line.qty) || 0), 0);

// Formatted on the server so the client never renders dates itself: no
// timezone hydration mismatch and no impure Date calls in render.
export const formatDate = (value: any, withTime = false) =>
    value
        ? new Date(value).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
              timeZone: "UTC",
          }) + (withTime ? " UTC" : "")
        : "";
