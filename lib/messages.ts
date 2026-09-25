import { money } from "@/components/ui/Price";
import { paymentName } from "@/lib/payments";

// There is no inbox collection behind this page. Every notice is derived from a
// timestamp the order already carries, so nothing can be listed that did not
// happen, and nothing that happened can be missing. A step the order does not
// record a time for — dispatch — produces no message rather than an invented
// one.

const iso = (value: any) => (value ? new Date(value).toISOString() : new Date(0).toISOString());

const shortName = (name: string) => {
    const clean = String(name || "your order").trim();

    return clean.length > 48 ? `${clean.slice(0, 45)}…` : clean;
};

export const orderNumber = (order: any) => String(order._id || "").slice(-8).toUpperCase();

export const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

const itemCount = (order: any) =>
    (order.products || []).reduce((total: number, line: any) => total + (Number(line.qty) || 1), 0);

const orderMessages = (order: any) => {
    const label = shortName(order.products?.[0]?.name);
    const id = orderNumber(order);
    const href = `/order/${order._id}`;
    const count = itemCount(order);
    const messages: any[] = [
        {
            id: `${order._id}-placed`,
            kind: "Order placed",
            title: `Your order of ${label}`,
            body: `Order #${id} · ${count} item${count === 1 ? "" : "s"} · ${money(order.total)}.`,
            date: iso(order.createdAt),
            href,
        },
    ];

    if (order.isPaid && order.paidAt) {
        messages.push({
            id: `${order._id}-paid`,
            kind: "Paid",
            title: `Order #${id} is paid`,
            body: `${money(order.total)} with ${paymentName(order.paymentMethod)}. No money actually moved: payments in this store are simulated.`,
            date: iso(order.paidAt),
            href,
        });
    }

    if (order.deliveredAt) {
        messages.push({
            id: `${order._id}-delivered`,
            kind: "Delivered",
            title: `Order #${id} was delivered`,
            body: order.shippingAddress?.city
                ? `Marked delivered to ${order.shippingAddress.city}. Anything that can still go back is on the returns tab.`
                : "Marked delivered. Anything that can still go back is on the returns tab.",
            date: iso(order.deliveredAt),
            href,
        });
    }

    for (const request of order.returnRequests || []) {
        messages.push({
            id: `${order._id}-return-${request._id}`,
            kind: request.status === "Refunded" ? "Refunded" : "Return requested",
            title:
                request.status === "Refunded"
                    ? `Refund for ${shortName(request.name)}`
                    : `Return requested for ${shortName(request.name)}`,
            body:
                request.status === "Refunded"
                    ? `The refund was sent to ${request.refundTo || "your original payment method"}.`
                    : `Reason given: ${request.reason || "not stated"}. Its progress is on the returns tab.`,
            date: iso(request.refundedAt || request.requestedAt),
            href: "/profile/returns",
        });
    }

    return messages;
};

// Newest first, the way anything that arrives is read.
export const buildMessages = (user: any, orders: any[] = []) => {
    const welcome = {
        id: "account-created",
        kind: "Account",
        title: "Your Markaz account is ready",
        body: `Created ${formatDate(iso(user?.createdAt || Date.now()))}. Notices about your orders turn up on this page.`,
        date: iso(user?.createdAt || Date.now()),
        href: "/profile",
    };

    return [welcome, ...orders.flatMap(orderMessages)].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
};
