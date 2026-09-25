// One shared placeholder backs every link that has no page in this build.
export const placeholder = (title: string) => `/placeholder?title=${encodeURIComponent(title)}`;

export const nearestSections = [
    { match: ["order", "transaction", "invoice", "purchase"], label: "Your Orders", href: "/profile/orders" },
    { match: ["return", "refund", "replace"], label: "Returns Center", href: "/profile/returns" },
    { match: ["payment", "card", "credit", "pay"], label: "Your Payments", href: "/profile/payment" },
    { match: ["address", "delivery", "shipping"], label: "Your Addresses", href: "/profile/address" },
    { match: ["prime", "membership", "subscription", "subscribe", "save", "kindle", "music", "audible", "video channel"], label: "Memberships & Subscriptions", href: "/profile/memberships" },
    { match: ["device", "content", "app", "library", "digital", "book"], label: "Devices and Content Library", href: "/profile/devices" },
    { match: ["message", "communication", "email", "notification", "alert"], label: "Your Messages", href: "/profile/messages" },
    { match: ["data", "privacy", "close", "security", "login", "password"], label: "Login & security", href: "/profile/security" },
    { match: ["gift", "voucher", "coupon", "balance", "reward", "point", "coin"], label: "Gift Cards", href: "/gift-cards" },
    { match: ["business", "seller", "sell", "vat", "tax"], label: "Markaz Business", href: "/business" },
    { match: ["family", "household", "teen", "kid", "child"], label: "Household", href: "/profile/household" },
    { match: ["preference", "language", "interest", "advertis", "shopping"], label: "Your Shopping preferences", href: "/profile/preferences" },
];

export const suggestionsFor = (title: string) => {
    const needle = String(title || "").toLowerCase();
    const hits = nearestSections.filter((section) =>
        section.match.some((word) => needle.includes(word))
    );

    return (hits.length > 0 ? hits : nearestSections.slice(0, 3)).slice(0, 3);
};
