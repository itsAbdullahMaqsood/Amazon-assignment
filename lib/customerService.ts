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
        intro: "The return window is the one the product page promised — 7, 30, 60 or 90 days, or none at all — and it is read from that product, line by line. The clock starts when the order is marked delivered, not when it was placed, so it begins when you actually have the thing.",
        sections: [
            {
                heading: "Starting a return",
                body: [
                    "Returns are a tab of Your Orders. It lists every line still inside its own window with the date it closes, and a return is started from a side sheet on the order itself: pick a reason, a quantity if you bought more than one, and leave a comment if it helps.",
                    "Reasons cover the usual cases: wrong item sent, defective or not working, bought by mistake, a better price available, damaged product in an undamaged box, missing parts, arrived too late, no longer needed, and a purchase you did not approve.",
                ],
            },
            {
                heading: "How your refund is issued",
                body: [
                    "You choose between your original payment method and your gift card balance when you submit the request. Gift card balance is normally the quicker of the two.",
                    "A request moves through three states: Requested while it is looked at, Approved once the item can be sent back, and Refunded when the money has gone out. The Returns tab shows each request at the state it has reached.",
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
        links: [{ label: "Your returns", href: "/profile/returns" }],
    },

    "shipping-delivery": {
        title: "Shipping & Delivery",
        icon: "shipping",
        blurb: "Delivery charges, addresses and where your package is.",
        intro: "Delivery is priced per product, not per order: each listing carries its own charge, the cart adds them up, and a listing with no charge ships free for everybody. A Markaz Plus membership waives all of them.",
        sections: [
            {
                heading: "What you are charged",
                body: [
                    "Your total is the goods, less any coupon, plus the delivery charges on the lines that carry one, less whatever your gift card balance covers. Every part of it is recomputed on the server from the products as they are now — the checkout preview and the order are the same calculation, so the two cannot disagree.",
                    "A coupon discounts the goods and never the delivery, and it is re-checked when the order is created, so an expired code falls away rather than quietly discounting the order.",
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
                    "There is no carrier and no tracking number. An order shows a timeline built from what it records — placed, paid, dispatched, delivered — and dispatch has no stored time, so it is shown as done without a date attached to it.",
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
        title: "Movies, pharmacy and Shabana",
        icon: "devices",
        blurb: "Markaz Movies, the pharmacy, groceries and Shabana.",
        intro: "Alongside the catalogue, this build has a few storefronts of its own. None of them ships a physical device, and none of them talks to a real service.",
        sections: [
            {
                heading: "Markaz Movies",
                body: [
                    "Markaz Movies lists titles seeded from TMDB. Nothing streams: a title can be bought or rented, which records it in your library against your account, and no film plays.",
                ],
            },
            {
                heading: "Pharmacy and groceries",
                body: [
                    "The pharmacy is a price look-up over drug labels from openFDA; it dispenses nothing and takes no prescription. Groceries is an ordinary part of the catalogue, arranged by aisle, and those you can buy.",
                ],
            },
            {
                heading: "Shabana",
                body: [
                    "Shabana is the assistant in the header. She is a language model with the catalogue behind her: she picks a department that exists, and every product she shows comes from the database rather than from her own text. Opened from a product page she is handed that product's description, specs and reviews, and answers only from them.",
                    "She can also look up a film in Markaz Movies, a medication's price in the pharmacy, and — when you are signed in — your own recent orders, membership and balance. For that last one a short summary of your account is sent to Google Gemini with your message: your first name, membership, balance, saved counts and your four most recent orders. Never an address, an email, a phone number or a payment detail. Privacy & data lists it.",
                    "There is no microphone. Nothing is recorded, and she cannot place an order for you.",
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
        intro: "Markaz Plus is a real membership on your account, and it does two things: it waives every delivery charge, and it shows you the Plus price in the pharmacy. No payment is ever taken for it.",
        sections: [
            {
                heading: "Delivery",
                body: [
                    "While a membership is active, the delivery charges on your order are waived — the checkout total is recomputed on the server, so it is the price you pay rather than a badge. The cart shows the same, struck through.",
                ],
            },
            {
                heading: "The trial, and what is charged",
                body: [
                    "Joining starts a 30-day free trial on the plan you pick, monthly or annual. After it, the plan would renew on its own cadence — but nothing is charged at any point in this build, so the dates behave as if you were billed while the delivery waiver is the only thing that is real.",
                    "Cancelling takes effect immediately and delivery is charged per item again from your next order.",
                ],
            },
            {
                heading: "Sharing it",
                body: [
                    "Your household — up to four people, added by email under Your Account — gets the delivery waiver too, for as long as your membership runs and sharing is switched on.",
                ],
            },
            {
                heading: "What it does not include",
                body: [
                    "There is no reading library, no music, no photo storage and no games. Markaz Movies is open to everyone and nothing behind it is gated on a membership: films are bought or rented individually.",
                ],
            },
        ],
        related: ["digital-services-devices", "shipping-delivery", "payments-gift-cards"],
        links: [
            { label: "Markaz Plus", href: "/plus" },
            { label: "Your household", href: "/profile/household" },
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
    { label: "Check the status of a return", href: "/profile/returns" },
    { label: "Change your delivery address", href: "/profile/address" },
    { label: "Change your password", href: "/profile/security" },
    { label: "Buy something you bought before", href: "/buy-again" },
    { label: "See the items you viewed", href: "/profile/recent" },
    { label: "Find today's coupons", href: "/coupons" },
];
