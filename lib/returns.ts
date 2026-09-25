// Pure helpers shared by the /profile/returns page, its client components and
// the /api/user/returns route. Nothing here touches mongoose.

export const RETURN_WINDOW_DAYS = 30;

// A product's own return policy, as its page states it: "30 days return
// policy" -> 30, "No return policy" / "No returns" -> 0. Unknown wording keeps
// the store default.
export const returnWindowDays = (policy: any) => {
    const text = String(policy || "");

    if (/no return/i.test(text)) return 0;

    const days = text.match(/(\d+)\s*day/i);

    return days ? Number(days[1]) : RETURN_WINDOW_DAYS;
};

// Everything about returning one order line: the window its product promised,
// the deadline, and how many are left to send back. `policy` is the product's
// refundPolicy, looked up by the caller (order lines don't store it).
export const lineReturnInfo = (order: any, index: number, policy: any) => {
    const windowDays = returnWindowDays(policy);
    const start = returnClockStart(order);
    const deadline = new Date(start.getTime() + windowDays * 24 * 60 * 60 * 1000);
    const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    const remaining = qtyReturnable(order, index);
    // Something can go back once it has arrived, and not after a cancellation.
    const eligible = order.status === "Completed";

    return {
        windowDays,
        deadline: deadline.toISOString(),
        daysLeft,
        remaining,
        returnable: eligible && windowDays > 0 && daysLeft > 0 && remaining > 0,
        reason: !eligible
            ? order.status === "Cancelled"
                ? "Order cancelled"
                : "Returns open once it's delivered"
            : windowDays === 0
              ? "This item can't be returned"
              : remaining < 1
                ? "Return requested"
                : daysLeft <= 0
                  ? "Return window closed"
                  : "",
    };
};

export const returnReasons = [
    "Wrong item sent",
    "Item defective or doesn't work",
    "Bought by mistake",
    "Better price available",
    "Product damaged but shipping box OK",
    "Missing parts or accessories",
    "Item arrived too late",
    "No longer needed",
    "Didn't approve purchase",
];

export const refundMethods = [
    {
        value: "Original payment method",
        hint: "Refunds are issued to the payment method used at checkout.",
    },
    {
        value: "Markaz gift card balance",
        hint: "Goes straight onto your balance, usually the fastest option.",
    },
];

export const returnStatuses = ["Return requested", "Return approved", "Refunded"];

export const returnTabs = [
    { label: "Return items", value: "" },
    { label: "Your returns", value: "requests" },
    { label: "Return status", value: "status" },
];

// The clock starts when the order arrived; orders that were never marked as
// delivered fall back to payment, then to when they were placed.
export const returnClockStart = (order: any) =>
    new Date(order.deliveredAt || order.paidAt || order.createdAt);

export const returnDeadline = (order: any) => {
    const start = returnClockStart(order);

    return new Date(start.getTime() + RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000);
};

export const daysLeftToReturn = (order: any) =>
    Math.ceil((returnDeadline(order).getTime() - Date.now()) / (24 * 60 * 60 * 1000));

// Cancelled orders are already off the books, so only live orders inside the
// window can be sent back.
export const isReturnable = (order: any) =>
    order.status !== "Cancelled" && returnDeadline(order).getTime() > Date.now();

export const formatDate = (value: any) =>
    new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

export const orderNumber = (id: any) => String(id).slice(-12).toUpperCase();

// Remaining quantity on a line once earlier requests are counted, so the same
// item cannot be returned twice.
export const qtyAlreadyRequested = (order: any, line: number) =>
    (order.returnRequests || [])
        .filter((request: any) => Number(request.line) === Number(line))
        .reduce((total: number, request: any) => total + (Number(request.qty) || 0), 0);

export const qtyReturnable = (order: any, line: number) =>
    Math.max(0, (Number(order.products?.[line]?.qty) || 0) - qtyAlreadyRequested(order, line));

export const statusBadge = (status: string) => {
    if (status === "Refunded") return "bg-success-soft text-success border-success/30";
    if (status === "Return approved") return "bg-accent-soft text-accent-ink border-accent";

    return "bg-warning-soft text-warning border-warning/30";
};

// What happens next, in the shopper's words, for each status the model allows.
export const statusHint = (status: string) => {
    if (status === "Refunded") return "Your refund has been issued.";
    if (status === "Return approved") return "Drop the item off, then your refund is issued.";

    return "We have your request. Approval usually lands within 24 hours.";
};
