// One source for the store's navigation, read by the header, the mobile drawer
// and the footer. Departments are not listed here: they come from the database.

// The specialty storefronts, each with its own page.
export const stores = [
    { label: "Groceries", href: "/groceries", description: "Fresh food and pantry staples" },
    { label: "Markaz Home", href: "/furniture", description: "Furniture by room and style" },
    { label: "Pharmacy", href: "/pharmacy", description: "Search medications and prices" },
    { label: "Registry & lists", href: "/registry", description: "Wedding, baby and gift lists" },
    { label: "Gift cards", href: "/gift-cards", description: "Balance, redeem and reload" },
    { label: "Markaz Plus", href: "/plus", description: "Membership benefits" },
    { label: "Markaz Business", href: "/business", description: "Buying for a company" },
    { label: "Sell on Markaz", href: "/sell", description: "Fees and how to start" },
];

export const quickLinks = [
    { label: "Deals", href: "/coupons" },
    { label: "Movies", href: "/movies" },
];

export const accountLinks = [
    { label: "Your account", href: "/profile" },
    { label: "Orders", href: "/profile/orders" },
    { label: "Returns", href: "/profile/returns" },
    { label: "Saved items", href: "/profile/wishlist" },
    { label: "Lists", href: "/lists" },
    { label: "Buy again", href: "/buy-again" },
    { label: "My List (Movies)", href: "/movies/my-list" },
    { label: "Membership", href: "/profile/memberships" },
];

export const helpLinks = [
    { label: "Help centre", href: "/customer-service" },
    { label: "Returns & refunds", href: "/customer-service/returns-refunds" },
    { label: "Delivery", href: "/customer-service/shipping-delivery" },
];

// Grocery and Furniture have storefronts of their own (above), so the header's
// department row leaves them out rather than listing them twice.
export const STOREFRONT_SLUGS = ["grocery", "furniture"];
