// One source for the store's navigation, read by the header, the mobile drawer
// and the footer. Departments are not listed here: they come from the database.

// The specialty storefronts, each with its own page.
export const stores = [
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

// Two departments have storefronts richer than a filtered grid: aisles for
// groceries, rooms and styles for the home. Their department links go there.
export const departmentHref = (slug: string) =>
    slug === "grocery" ? "/groceries" : slug === "furniture" ? "/furniture" : `/browse?category=${slug}`;
