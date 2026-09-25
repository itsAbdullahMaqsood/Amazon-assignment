// Every row in the drawer points at a screen this build actually has. Amazon's
// own labels are kept where a real page answers to them, and swapped for the
// nearest thing we ship where they do not (Fire TV, Luna, Audible and friends
// have no screen here, so they are not offered).
export const menuSections = [
    {
        title: "Trending",
        links: [
            { label: "Best Sellers", href: "/browse?sort=topSelling" },
            { label: "New Releases", href: "/browse?sort=newest" },
            { label: "Grocery", href: "/groceries" },
            { label: "Prescription Delivery", href: "/pharmacy" },
        ],
    },
    {
        title: "Digital Content & Devices",
        links: [
            { label: "Markaz Movies", href: "/movies" },
            { label: "Your Watchlist", href: "/movies/my-list" },
            { label: "Content Library", href: "/profile/devices" },
            { label: "Devices", href: "/profile/devices" },
            { label: "Memberships & Subscriptions", href: "/profile/memberships" },
            { label: "Plus", href: "/plus" },
        ],
    },
    {
        title: "Shop By Department",
        links: [
            { label: "Women's Clothing", href: "/browse?category=women-clothing" },
            { label: "Men's Clothing", href: "/browse?category=men" },
            { label: "Shoes", href: "/browse?category=shoes" },
            { label: "Beauty", href: "/browse?category=beauty" },
            { label: "Electronics", href: "/browse?category=electronics" },
            { label: "Kids", href: "/browse?category=kids", more: true },
            { label: "Home & Furniture", href: "/furniture", more: true },
            { label: "See all departments", href: "/browse", more: true },
        ],
    },
    {
        title: "Programs & Features",
        links: [
            { label: "Buy Again", href: "/buy-again" },
            { label: "Medical Care & Pharmacy", href: "/pharmacy" },
            { label: "Coupons", href: "/coupons" },
            { label: "Gift Cards", href: "/gift-cards" },
            { label: "Markaz Business", href: "/business", more: true },
            { label: "Sell on Markaz", href: "/sell", more: true },
            { label: "Lists & Registry", href: "/lists", more: true },
            { label: "Find a Registry", href: "/registry/find", more: true },
        ],
    },
    {
        title: "Help & Settings",
        links: [
            { label: "Your Account", href: "/profile" },
            { label: "Your Orders", href: "/profile/orders" },
            { label: "Returns Center", href: "/profile/returns" },
            { label: "Customer Service", href: "/customer-service" },
        ],
    },
];
