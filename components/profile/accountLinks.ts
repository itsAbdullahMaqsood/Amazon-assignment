// One shared placeholder backs every link that has no page in this build.
export const placeholder = (title: string) => `/placeholder?title=${encodeURIComponent(title)}`;

export const accountCards = [
    {
        title: "Your Orders",
        description: "Track, return, cancel an order, download invoice or buy again",
        icon: "ArchiveBoxIcon",
        href: "/profile/orders",
    },
    {
        title: "Login & security",
        description: "Edit login, name, and mobile number",
        icon: "ShieldCheckIcon",
        href: "/profile/security",
    },
    {
        title: "Plus",
        description: "Manage your membership, view benefits, and payment settings",
        icon: "SparklesIcon",
        href: "/plus",
    },
    {
        title: "Your Addresses",
        description: "Edit, remove or set default address",
        icon: "HomeIcon",
        href: "/profile/address",
    },
    {
        title: "Your business account",
        description:
            "Sign up to save with business-exclusive pricing, schedule fast deliveries during business-hours, and more",
        icon: "BuildingOffice2Icon",
        href: "/business",
    },
    {
        title: "Gift cards",
        description: "View balance or redeem a card, and purchase a new Gift Card",
        icon: "GiftIcon",
        href: "/gift-cards",
    },
    {
        title: "Your Payments",
        description: "View all transactions, manage payment methods and settings",
        icon: "CreditCardIcon",
        href: "/profile/payment",
    },
    {
        title: "Your Household",
        description: "Manage profiles, sharing, and permissions in one place",
        icon: "UsersIcon",
        href: "/profile/household",
    },
    {
        title: "Digital Services and Device Support",
        description: "Troubleshoot device issues, manage or cancel digital subscriptions",
        icon: "DevicePhoneMobileIcon",
        href: "/profile/devices",
    },
    {
        title: "Your Lists",
        description: "View, modify, and share your lists, or create new ones",
        icon: "ListBulletIcon",
        href: "/profile/wishlist",
    },
    {
        title: "Customer Service",
        description: "Browse self service options, help articles or contact us",
        icon: "LifebuoyIcon",
        href: "/customer-service",
    },
    {
        title: "Your Messages",
        description: "View or respond to messages from Markaz, Sellers and Buyers",
        icon: "EnvelopeIcon",
        href: "/profile/messages",
    },
];

const routed: any = {
    "About You": "/profile/security",
    "Your Addresses": "/profile/address",
    "Your Payments": "/profile/payment",
    "Your Transactions": "/profile/orders",
    "Markaz credit cards": "/profile/credit-cards",
    "Your Shopping preferences": "/profile/preferences",
    Coupons: "/coupons",
    "All things Shabana": "/",
    "Content Library": "/profile/devices",
    Devices: "/profile/devices",
    "Markaz Movies settings": "/movies",
    "Kindle Unlimited": "/profile/memberships",
    "Markaz Movies Channels": "/profile/memberships",
    "Music Unlimited": "/profile/memberships",
    "Subscribe & Save": "/profile/memberships",
    "Audible membership": "/profile/memberships",
    "Other subscriptions": "/profile/memberships",
    "Your seller account": "/sell",
    "Markaz Pharmacy": "/pharmacy",
    "Request your data": "/profile/data",
    "Data Access and Requests": "/profile/data",
    "Close Your Markaz Account": "/profile/data",
    "Manage Your Household": "/profile/household",
    "Recalls and Product Safety Alerts": "/profile/recalls",
    "Privacy Notice": "/profile/data",
};

const link = (label: string) => ({ label, href: routed[label] || placeholder(label) });

// Keyword → the closest real screen, used by /placeholder to suggest somewhere
// to go instead of being a dead end.
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

export const accountLinkCards = [
    {
        heading: "Ordering and shopping preferences",
        links: [
            "About You",
            "Your Addresses",
            "Markaz credit cards",
            "Your Payments",
            "Your Transactions",
            "Your Shopping preferences",
            "Your Content",
            "1-Click settings",
            "Markaz Key settings",
            "Whole Foods Market settings",
            "Language preferences",
            "Manage saved IDs",
            "Coupons",
            "Product Vouchers",
            "VAT registration number",
            "Recalls and Product Safety Alerts",
        ].map(link),
    },
    {
        heading: "Digital content and devices",
        links: [
            "All things Shabana",
            "Content Library",
            "Devices",
            "Manage Digital Delivery",
            "Your apps",
            "Markaz Movies settings",
            "Markaz Music settings",
            "Manage Markaz Drive and photos",
            "Twitch settings",
            "Audible settings",
            "Markaz Coins",
            "Digital gifts you've received",
            "Digital and device forum",
            "Comixology settings",
            "Verify AI Generated Content",
        ].map(link),
    },
    {
        heading: "Memberships and subscriptions",
        links: [
            "Kindle Unlimited",
            "Markaz Movies Channels",
            "Music Unlimited",
            "Subscribe & Save",
            "Markaz Kids+",
            "Audible membership",
            "Auto Buy",
            "Magazine subscriptions",
            "One Medical membership for Plus members",
            "Other subscriptions",
        ].map(link),
    },
    {
        heading: "Communication and content",
        links: [
            "Email subscriptions",
            "Advertising preferences",
            "Communication preferences",
            "Shipment updates via text",
            "Shabana shopping notifications",
            "Videos you've uploaded",
            "Purchase Reminders",
        ].map(link),
    },
    {
        heading: "Shopping programs and rentals",
        links: [
            "Buy now pay over time",
            "Manage Your Household",
            "Rentals by Markaz",
            "No-Rush rewards summary",
            "Teens Program",
            "Pets",
            "Shop with Points",
            "Markaz Second Chance",
            "Benefits balance",
            "Your credit & benefit balances",
        ].map(link),
    },
    {
        heading: "Other programs",
        links: [
            "Account Linking",
            "Your seller account",
            "Markaz Pay",
            "Manage your trade-ins",
            "Markaz Web Services",
            "Markaz tax exemption program",
            "Your Interests",
            "Markaz Pharmacy",
            "Health Benefits Connector",
            "One Medical Pay-per-visit",
        ].map(link),
    },
    {
        heading: "Manage your data",
        links: [
            "Request your data",
            "Data Access and Requests",
            "Manage apps & services with data access",
            "Close Your Markaz Account",
            "Privacy Notice",
            "Protect yourself from scams",
        ].map(link),
    },
];

export const flyoutLists = [
    { label: "Create a List", href: "/lists/create" },
    { label: "Find a List or Registry", href: "/registry/find" },
    { label: "Your Saved Books", href: "/profile/devices" },
];

export const flyoutAccount = [
    { label: "Account", href: "/profile" },
    { label: "Orders", href: "/profile/orders" },
    { label: "Keep Shopping For", href: "/keep-shopping" },
    { label: "Recommendations", href: "/profile" },
    { label: "Returns", href: "/profile/returns" },
    { label: "Browsing History", href: "/profile/recent" },
    { label: "Your Shopping preferences", href: "/profile/preferences" },
    { label: "Start a Selling Account", href: "/sell" },
    { label: "Markaz Credit Cards", href: "/profile/credit-cards" },
    { label: "Recalls and Product Safety Alerts", href: "/profile/recalls" },
    { label: "Watchlist", href: "/movies/my-list" },
    { label: "Video Purchases & Rentals", href: "/movies/my-list" },
    { label: "Kindle Unlimited", href: "/profile/memberships" },
    { label: "Content Library", href: "/profile/devices" },
    { label: "Devices", href: "/profile/devices" },
    { label: "Subscribe & Save Items", href: "/profile/memberships" },
    { label: "Memberships & Subscriptions", href: "/profile/memberships" },
    { label: "Plus Membership", href: "/plus" },
    { label: "Medical Care & Pharmacy", href: "/pharmacy" },
    { label: "Music Library", href: "/profile/devices" },
    { label: "Create Your Free Business Account", href: "/business" },
    { label: "Customer Service", href: "/customer-service" },
];
