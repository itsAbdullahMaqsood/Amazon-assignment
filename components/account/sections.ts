// One list of the account's sections, read by the rail in the account layout,
// the phone menu inside it and the grid at the bottom of the overview, so the
// three can never disagree about what the account holds.
export const accountSections = [
    {
        heading: "Orders",
        links: [
            { label: "Your orders", href: "/profile/orders", description: "Track, return or buy again" },
            { label: "Returns", href: "/profile/returns", description: "Requests, and what can still go back" },
            { label: "Product recalls", href: "/profile/recalls", description: "Safety alerts on what you own" },
        ],
    },
    {
        heading: "Shopping",
        links: [
            { label: "Saved items", href: "/profile/wishlist", description: "Everything you kept for later" },
            { label: "Your lists", href: "/lists", description: "Named lists and registries" },
            { label: "Browsing history", href: "/profile/recent", description: "What you looked at recently" },
        ],
    },
    {
        heading: "Settings",
        links: [
            { label: "Addresses", href: "/profile/address", description: "Where your orders go" },
            { label: "Payment", href: "/profile/payment", description: "How you pay at checkout" },
            { label: "Login & security", href: "/profile/security", description: "Your name, email and password" },
            { label: "Shopping preferences", href: "/profile/preferences", description: "What the store remembers" },
        ],
    },
    {
        heading: "Membership & sharing",
        links: [
            { label: "Markaz Plus", href: "/profile/memberships", description: "Membership and subscriptions" },
            { label: "Household", href: "/profile/household", description: "People you share with" },
            { label: "Devices", href: "/profile/devices", description: "Where you are signed in" },
        ],
    },
    {
        heading: "Messages & data",
        links: [
            { label: "Your messages", href: "/profile/messages", description: "Notices about your orders" },
            { label: "Privacy & data", href: "/profile/data", description: "Export, clear or close the account" },
        ],
    },
];

export const overviewLink = { label: "Account overview", href: "/profile" };

export const allAccountLinks = [overviewLink, ...accountSections.flatMap((section) => section.links)];

// The section a URL is inside, used to title the phone menu. An exact match, so
// /profile is the overview rather than a prefix of everything below it.
export const sectionFor = (pathname: string) =>
    allAccountLinks.find((link) => link.href === pathname) || overviewLink;
