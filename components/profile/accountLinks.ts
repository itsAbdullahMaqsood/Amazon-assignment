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
        title: "Prime",
        description: "Manage your membership, view benefits, and payment settings",
        icon: "SparklesIcon",
        href: placeholder("Prime"),
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
        href: placeholder("Your business account"),
    },
    {
        title: "Gift cards",
        description: "View balance or redeem a card, and purchase a new Gift Card",
        icon: "GiftIcon",
        href: placeholder("Gift cards"),
    },
    {
        title: "Your Payments",
        description: "View all transactions, manage payment methods and settings",
        icon: "CreditCardIcon",
        href: "/profile/payment",
    },
    {
        title: "Your Amazon Family",
        description: "Manage profiles, sharing, and permissions in one place",
        icon: "UsersIcon",
        href: placeholder("Your Amazon Family"),
    },
    {
        title: "Digital Services and Device Support",
        description: "Troubleshoot device issues, manage or cancel digital subscriptions",
        icon: "DevicePhoneMobileIcon",
        href: placeholder("Digital Services and Device Support"),
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
        href: placeholder("Customer Service"),
    },
    {
        title: "Your Messages",
        description: "View or respond to messages from Amazon, Sellers and Buyers",
        icon: "EnvelopeIcon",
        href: placeholder("Your Messages"),
    },
];

const routed: any = {
    "Your Addresses": "/profile/address",
    "Your Payments": "/profile/payment",
    "Your Transactions": "/profile/orders",
    "About You": "/profile/security",
};

const link = (label: string) => ({ label, href: routed[label] || placeholder(label) });

export const accountLinkCards = [
    {
        heading: "Ordering and shopping preferences",
        links: [
            "About You",
            "Your Addresses",
            "Amazon credit cards",
            "Your Payments",
            "Your Transactions",
            "Your Shopping preferences",
            "Your Content",
            "1-Click settings",
            "Amazon Key settings",
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
            "All things Alexa",
            "Content Library",
            "Devices",
            "Manage Digital Delivery",
            "Your apps",
            "Prime Video settings",
            "Amazon Music settings",
            "Manage Amazon Drive and photos",
            "Twitch settings",
            "Audible settings",
            "Amazon Coins",
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
            "Prime Video Channels",
            "Music Unlimited",
            "Subscribe & Save",
            "Amazon Kids+",
            "Audible membership",
            "Auto Buy",
            "Magazine subscriptions",
            "One Medical membership for Prime members",
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
            "Alexa shopping notifications",
            "Videos you've uploaded",
            "Purchase Reminders",
        ].map(link),
    },
    {
        heading: "Shopping programs and rentals",
        links: [
            "Buy now pay over time",
            "Manage Your Amazon Family",
            "Rentals by Amazon",
            "No-Rush rewards summary",
            "Teens Program",
            "Pets",
            "Shop with Points",
            "Amazon Second Chance",
            "Benefits balance",
            "Your credit & benefit balances",
        ].map(link),
    },
    {
        heading: "Other programs",
        links: [
            "Account Linking",
            "Your seller account",
            "Amazon Pay",
            "Manage your trade-ins",
            "Amazon Web Services",
            "Amazon tax exemption program",
            "Your Interests",
            "Amazon Pharmacy",
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
            "Close Your Amazon Account",
            "Privacy Notice",
            "Protect yourself from scams",
        ].map(link),
    },
];

export const flyoutLists = [
    { label: "Create a List", href: "/lists/create" },
    { label: "Find a List or Registry", href: "/registry/find" },
    { label: "Your Saved Books", href: placeholder("Your Saved Books") },
];

export const flyoutAccount = [
    { label: "Account", href: "/profile" },
    { label: "Orders", href: "/profile/orders" },
    { label: "Keep Shopping For", href: "/keep-shopping" },
    { label: "Recommendations", href: "/profile" },
    { label: "Returns", href: placeholder("Returns") },
    { label: "Browsing History", href: "/profile/recent" },
    { label: "Your Shopping preferences", href: placeholder("Your Shopping preferences") },
    { label: "Start a Selling Account", href: placeholder("Start a Selling Account") },
    { label: "Amazon Credit Cards", href: placeholder("Amazon Credit Cards") },
    {
        label: "Recalls and Product Safety Alerts",
        href: placeholder("Recalls and Product Safety Alerts"),
    },
    { label: "Watchlist", href: placeholder("Watchlist") },
    { label: "Video Purchases & Rentals", href: placeholder("Video Purchases & Rentals") },
    { label: "Kindle Unlimited", href: placeholder("Kindle Unlimited") },
    { label: "Content Library", href: placeholder("Content Library") },
    { label: "Devices", href: placeholder("Devices") },
    { label: "Subscribe & Save Items", href: placeholder("Subscribe & Save Items") },
    { label: "Memberships & Subscriptions", href: placeholder("Memberships & Subscriptions") },
    { label: "Prime Membership", href: placeholder("Prime Membership") },
    { label: "Medical Care & Pharmacy", href: placeholder("Medical Care & Pharmacy") },
    { label: "Music Library", href: placeholder("Music Library") },
    {
        label: "Create Your Free Business Account",
        href: placeholder("Create Your Free Business Account"),
    },
    { label: "Customer Service", href: placeholder("Customer Service") },
];
