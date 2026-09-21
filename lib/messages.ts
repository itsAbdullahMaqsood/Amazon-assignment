// The message centre has no inbox collection behind it: every message is derived
// from what the signed-in user already has — their account and their orders — so
// the list stays truthful without a second source of data. Pure functions only,
// no mongoose, so the client component can import the same helpers.

export const folders = [
    { value: "inbox", label: "Inbox" },
    { value: "buyer-seller", label: "Buyer/Seller Messages" },
    { value: "sent", label: "Sent Messages" },
    { value: "archived", label: "Archived / Deleted Messages" },
];

export const DEFAULT_FOLDER = "inbox";

const iso = (value: any) => (value ? new Date(value).toISOString() : new Date(0).toISOString());

// Amazon truncates the item name in a subject line rather than wrapping it.
const shortName = (name: string) => {
    const clean = String(name || "your order").trim();

    return clean.length > 48 ? `${clean.slice(0, 45)}...` : clean;
};

const orderLabel = (order: any) => shortName(order.products?.[0]?.name);

const itemCount = (order: any) =>
    (order.products || []).reduce((acc: number, item: any) => acc + (Number(item.qty) || 1), 0);

const shortId = (order: any) => String(order._id || "").slice(-8).toUpperCase();

export const formatDate = (value: string) => {
    const date = new Date(value);
    const sameYear = date.getFullYear() === new Date().getFullYear();

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        ...(sameYear ? {} : { year: "numeric" }),
    });
};

const welcomeMessage = (user: any) => ({
    id: "account-welcome",
    folder: "inbox",
    from: "Amazon.com",
    subject: "Welcome to Amazon.com",
    snippet: `Hello ${user?.name || "there"}, your Amazon account is ready.`,
    date: iso(user?.createdAt || Date.now()),
    body: [
        `Hello ${user?.name || "there"},`,
        "Thanks for creating an Amazon account. This message centre keeps every notice about your orders in one place — order confirmations, shipping updates and review requests all arrive here.",
        "You can archive anything you have finished with; archived messages move to the Archived / Deleted Messages folder and can be restored from there.",
    ],
    href: "/profile",
});

// Each order fans out into the notices Amazon would have sent for it, and only
// those: a shipping note exists when the order was paid for, a delivery note and
// a review request only once `deliveredAt` is set.
const orderMessages = (order: any) => {
    const label = orderLabel(order);
    const id = shortId(order);
    const href = `/order/${order._id}`;
    const count = itemCount(order);
    const messages: any[] = [
        {
            id: `${order._id}-confirmation`,
            folder: "inbox",
            from: "auto-confirm@amazon.com",
            subject: `Your Amazon.com order of ${label}`,
            snippet: `Order #${id} · ${count} item${count === 1 ? "" : "s"} · $${Number(order.total || 0).toFixed(2)}`,
            date: iso(order.createdAt),
            body: [
                "Thank you for shopping with us.",
                `We have received order #${id} for ${count} item${count === 1 ? "" : "s"}, totalling $${Number(order.total || 0).toFixed(2)}.`,
                "You can review the full receipt and track progress from your order details page.",
            ],
            href,
        },
    ];

    if (order.isPaid) {
        messages.push({
            id: `${order._id}-shipped`,
            folder: "inbox",
            from: "ship-confirm@amazon.com",
            subject: `Your Amazon.com order of ${label} has shipped`,
            snippet: `Order #${id} is on its way${order.shippingAddress?.city ? ` to ${order.shippingAddress.city}` : ""}.`,
            date: iso(order.paidAt || order.createdAt),
            body: [
                `Your parcel for order #${id} has left our fulfilment centre.`,
                order.shippingAddress?.address1
                    ? `It is heading to ${order.shippingAddress.address1}, ${order.shippingAddress.city || ""} ${order.shippingAddress.zipCode || ""}.`
                    : "Tracking becomes available once the carrier scans the parcel.",
                "No action is needed from you.",
            ],
            href,
        });

        messages.push({
            id: `${order._id}-seller`,
            folder: "buyer-seller",
            from: "Amazon.com Marketplace",
            subject: `Dispatch note for ${label}`,
            snippet: "The seller has confirmed dispatch and answered any open questions.",
            date: iso(order.paidAt || order.createdAt),
            body: [
                `Hello ${order.shippingAddress?.firstName || "there"},`,
                `Thanks for your order. ${label} left our warehouse and is now with the carrier.`,
                "Reply to this thread if anything arrives damaged and we will sort out a replacement.",
            ],
            href,
        });
    }

    if (order.deliveredAt) {
        messages.push({
            id: `${order._id}-delivered`,
            folder: "inbox",
            from: "shipment-tracking@amazon.com",
            subject: `Delivered: your Amazon.com order of ${label}`,
            snippet: "Your package was handed over at the delivery address.",
            date: iso(order.deliveredAt),
            body: [
                `Order #${id} was delivered.`,
                "If the parcel is not where you expected, check with anyone else at the address before reporting it missing.",
            ],
            href,
        });

        messages.push({
            id: `${order._id}-review`,
            folder: "inbox",
            from: "Amazon Customer Reviews",
            subject: `How did you like ${label}?`,
            snippet: "Share a rating so other shoppers know what to expect.",
            date: iso(order.deliveredAt),
            body: [
                `You recently received ${label}.`,
                "A short review — even one line — helps the next shopper decide. Ratings are public, your address is not.",
            ],
            href,
        });
    }

    // A cancelled order is the one case where the customer did the writing, so it
    // is what the Sent folder is built from.
    if (order.status === "Cancelled") {
        messages.push({
            id: `${order._id}-cancel`,
            folder: "sent",
            from: "You",
            subject: `Cancellation request for order #${id}`,
            snippet: `Please cancel my order of ${label}.`,
            date: iso(order.updatedAt || order.createdAt),
            body: [
                "Hello,",
                `Please cancel order #${id} (${label}). I no longer need the item.`,
                "Thank you.",
            ],
            href,
        });
    }

    return messages;
};

// Newest first, the way every mail client orders a folder.
export const buildMessages = (user: any, orders: any[] = []) =>
    [welcomeMessage(user), ...orders.flatMap(orderMessages)].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
