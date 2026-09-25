// The help centre's content, keyed by URL slug. Everything here describes what
// this build actually does — the copy is checked against the real checkout,
// order and returns code rather than against Amazon's published policies.

export const helpTopics: any = {
    "your-orders": {
        title: "Your Orders",
        icon: "orders",
        blurb: "Track a package, find an invoice or check what an order status means.",
        intro: "Every order you place is stored against your account and stays there. Your Orders is the place to re-read an order, follow its progress or open its invoice.",
        sections: [
            {
                heading: "Finding an order",
                body: [
                    "Your Orders lists your orders newest first. The dropdown above the list narrows it to the last 30 days, the past 3 or 6 months, or a single calendar year, and the search box matches on product name.",
                    "Opening an order shows its items, the address it was shipped to, the payment method and the totals, including any coupon that was applied.",
                ],
            },
            {
                heading: "What each status means",
                body: [
                    "Not Processed — the order exists but nothing has happened to it yet. Processing — it is being picked and packed. Dispatched — it has left the warehouse. Completed — it has been delivered. Cancelled — it will not ship, and nothing will be charged.",
                    "An order that has not been paid for shows as payment pending until the payment is recorded.",
                ],
            },
            {
                heading: "Changing or cancelling",
                body: [
                    "This build does not let you edit an order once it is placed. If something is wrong, wait for it to arrive and start a return, or place a new order with the right items.",
                ],
            },
        ],
        related: ["returns-refunds", "shipping-delivery", "payments-gift-cards"],
        links: [
            { label: "Go to Your Orders", href: "/profile/orders" },
            { label: "Buy it again", href: "/buy-again" },
        ],
    },

    "returns-refunds": {
        title: "Returns & Refunds",
        icon: "returns",
        blurb: "Send something back, pick a refund method and follow the request.",
        intro: "Items can be returned within 30 days. The clock starts the day an order is delivered; if an order was never marked as delivered, it starts from the payment date, and failing that from the day the order was placed.",
        sections: [
            {
                heading: "Starting a return",
                body: [
                    "The Returns Center lists every order still inside its 30-day window, item by item. Choose Return or replace items next to the one you want to send back, pick a reason and, if it helps, leave a comment.",
                    "Reasons cover the usual cases: wrong item sent, defective or not working, bought by mistake, a better price available, damaged product in an undamaged box, missing parts, arrived too late, no longer needed, and a purchase you did not approve.",
                ],
            },
            {
                heading: "How your refund is issued",
                body: [
                    "You choose between your original payment method and your gift card balance when you submit the request. Gift card balance is normally the quicker of the two.",
                    "A request moves through three states: Return requested while we look at it, Return approved once the item can be sent back, and Refunded when the money has gone out. The Return status tab groups your requests by that state.",
                ],
            },
            {
                heading: "Items you can only return once",
                body: [
                    "Each line on an order can be returned once. After a request is submitted, that line shows as already requested and the button disappears, so you will not accidentally file the same return twice.",
                ],
            },
        ],
        related: ["your-orders", "shipping-delivery", "payments-gift-cards"],
        links: [{ label: "Open the Returns Center", href: "/profile/returns" }],
    },

    "shipping-delivery": {
        title: "Shipping & Delivery",
        icon: "shipping",
        blurb: "Delivery charges, addresses and where your package is.",
        intro: "Shipping in this build is a single flat charge applied once per order rather than per item, and that charge is currently zero — so every order ships free, however many items are in it.",
        sections: [
            {
                heading: "What you are charged",
                body: [
                    "Your order total is the cart total, less any coupon you applied at checkout, plus the flat shipping charge. Because that charge is zero and no tax is added, the total you see on the order is the total you agreed to in the cart.",
                    "A coupon is re-checked on the server when the order is created, so an expired code simply falls away instead of quietly discounting the order.",
                ],
            },
            {
                heading: "Delivery addresses",
                body: [
                    "Addresses live in your account, and one of them is marked active. The active address is the one pre-selected at checkout; you can switch to another or add a new one before placing the order.",
                    "The address is copied onto the order when you place it, so editing your address book later never rewrites an order you already placed.",
                ],
            },
            {
                heading: "Tracking",
                body: [
                    "Progress is shown as the order status rather than as carrier tracking: Processing, then Dispatched, then delivered. Open the order to see where it currently stands.",
                ],
            },
        ],
        related: ["your-orders", "returns-refunds", "managing-your-account"],
        links: [
            { label: "Manage your addresses", href: "/profile/address" },
            { label: "Go to Your Orders", href: "/profile/orders" },
        ],
    },

    "managing-your-account": {
        title: "Managing Your Account",
        icon: "account",
        blurb: "Your details, addresses, lists and browsing history.",
        intro: "Your Account gathers everything tied to your sign-in: what we know about you, where your orders go and the things you have saved.",
        sections: [
            {
                heading: "Your details",
                body: [
                    "Your name, email and profile picture come from the account you signed in with. If you signed in with Google or GitHub, an account is created for you the first time, so your orders and lists have somewhere to live.",
                ],
            },
            {
                heading: "Saved things",
                body: [
                    "Lists and registries, your wishlist and your browsing history are all kept per account. Browsing history records the products you open, and it is what the recommendation rows on the site are built from.",
                ],
            },
            {
                heading: "Closing your account",
                body: [
                    "There is no self-service account closure in this build. Nothing you do here leaves the site, and no marketing email is ever sent.",
                ],
            },
        ],
        related: ["security-privacy", "your-orders", "payments-gift-cards"],
        links: [
            { label: "Go to Your Account", href: "/profile" },
            { label: "Login & security", href: "/profile/security" },
        ],
    },

    "payments-gift-cards": {
        title: "Payments & Gift Cards",
        icon: "payments",
        blurb: "Payment methods, coupons and your balance.",
        intro: "Checkout offers PayPal, a credit card or cash on delivery. This is a coursework build: no card is charged and no money moves, whichever you pick.",
        sections: [
            {
                heading: "Paying for an order",
                body: [
                    "Pick a payment method on the checkout page before placing the order. The choice is stored on the order so you can see later how you said you would pay.",
                    "Because nothing is really charged, an order starts out unpaid and is marked as paid separately.",
                ],
            },
            {
                heading: "Coupons",
                body: [
                    "A coupon code entered in the order summary is validated against its start and end dates and applied as a percentage off the cart total. The discount is recalculated on the server when the order is created, so the price on your order is always the one the coupon actually entitles you to.",
                    "The Coupons page lists the products currently carrying a discount.",
                ],
            },
            {
                heading: "Gift card balance",
                body: [
                    "Gift card balance exists as a refund destination for returns. You cannot top it up or spend it at checkout in this build.",
                ],
            },
        ],
        related: ["your-orders", "returns-refunds", "security-privacy"],
        links: [
            { label: "Browse coupons", href: "/coupons" },
            { label: "Your payments", href: "/profile/payment" },
        ],
    },

    "digital-services-devices": {
        title: "Digital Services & Devices",
        icon: "devices",
        blurb: "Markaz Movies, the pharmacy, groceries and the voice panel.",
        intro: "Alongside the catalogue, this build has a few storefronts of its own. None of them ships a physical device, and none of them talks to a real service.",
        sections: [
            {
                heading: "Markaz Movies",
                body: [
                    "The Markaz Movies area lists titles from our own database with their artwork and detail pages. Nothing streams: selecting a title opens its page rather than a player.",
                ],
            },
            {
                heading: "Pharmacy and groceries",
                body: [
                    "The pharmacy lists medications with search, and the grocery storefront lists everyday items. Both read from the same database as the rest of the site and neither dispenses anything.",
                ],
            },
            {
                heading: "The voice panel",
                body: [
                    "The assistant panel in the header answers from a fixed set of intents and can navigate the site for you. It does not record audio and does not send anything anywhere.",
                ],
            },
        ],
        related: ["prime", "managing-your-account", "security-privacy"],
        links: [
            { label: "Markaz Movies", href: "/movies" },
            { label: "Pharmacy", href: "/pharmacy" },
            { label: "Groceries", href: "/groceries" },
        ],
    },

    prime: {
        title: "Plus",
        icon: "prime",
        blurb: "What membership does, and does not, mean here.",
        intro: "Plus is not a paid membership in this build. There is no subscription to start, pause or cancel, and no card on file that could be billed for one.",
        sections: [
            {
                heading: "Delivery",
                body: [
                    "The benefit members would normally pay for — free delivery — applies to everyone here, because the flat shipping charge on every order is zero.",
                ],
            },
            {
                heading: "Deals",
                body: [
                    "Plus-branded deals on the Coupons page are ordinary catalogue discounts with a label attached; the deepest discounts are the ones shown as Plus deals. Anyone signed in can clip them.",
                ],
            },
            {
                heading: "Video",
                body: [
                    "The Markaz Movies area is open to everyone. Nothing behind it is gated on a membership.",
                ],
            },
        ],
        related: ["digital-services-devices", "shipping-delivery", "payments-gift-cards"],
        links: [
            { label: "Markaz Movies", href: "/movies" },
            { label: "Today's deals", href: "/coupons" },
        ],
    },

    "security-privacy": {
        title: "Security & Privacy",
        icon: "security",
        blurb: "Passwords, sign-in and what is stored about you.",
        intro: "Your account is protected by the password you set, or by the Google or GitHub account you signed in with. Passwords are hashed before they are stored and are never readable, including by us.",
        sections: [
            {
                heading: "Your password",
                body: [
                    "Change your password from Login & security. You have to enter your current password first, and the new one is re-hashed before it replaces the old one.",
                    "If you have forgotten it, the sign-in page can email you a reset link.",
                ],
            },
            {
                heading: "Staying signed in",
                body: [
                    "Your session is a signed token in a cookie rather than a copy of your details, and it is what every page and API route checks before showing you anything of yours. Signing out discards it.",
                ],
            },
            {
                heading: "What we store",
                body: [
                    "Your name and email, the addresses you saved, your orders, your lists and the products you have viewed. No card numbers are stored, because no card is ever taken.",
                ],
            },
        ],
        related: ["managing-your-account", "payments-gift-cards", "your-orders"],
        links: [
            { label: "Login & security", href: "/profile/security" },
            { label: "Your addresses", href: "/profile/address" },
        ],
    },
};

// The tile grid on the hub, in the order Amazon shows them.
export const topicOrder = [
    "your-orders",
    "returns-refunds",
    "shipping-delivery",
    "managing-your-account",
    "payments-gift-cards",
    "digital-services-devices",
    "prime",
    "security-privacy",
];

export const getTopic = (slug: string) => helpTopics[slug] || null;

export const topicList = () =>
    topicOrder.map((slug) => ({ slug, ...helpTopics[slug] }));

// "Some things you can do here": the shortcuts that resolve to a real screen.
export const quickLinks = [
    { label: "Track or view an order", href: "/profile/orders" },
    { label: "Return or replace an item", href: "/profile/returns" },
    { label: "Check the status of a return", href: "/profile/returns?tab=status" },
    { label: "Change your delivery address", href: "/profile/address" },
    { label: "Change your password", href: "/profile/security" },
    { label: "Buy something you bought before", href: "/buy-again" },
    { label: "See the items you viewed", href: "/profile/recent" },
    { label: "Find today's coupons", href: "/coupons" },
];
