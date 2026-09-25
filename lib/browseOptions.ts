// Shared by the browse and deals pages (server) and their sort control (client).
export const sortOptions = [
    { value: "relevance", label: "Best match", searchOnly: true },
    { value: "discount", label: "Biggest saving", dealsOnly: true },
    { value: "popular", label: "Most popular" },
    { value: "rating", label: "Top rated" },
    { value: "newest", label: "Newest" },
    { value: "price-asc", label: "Price: low to high" },
    { value: "price-desc", label: "Price: high to low" },
];

// The tiers the deals page can offer, each meaning "this much off or more",
// read against the deepest discount on any of a product's variants. Which of
// them actually appear is decided by the catalogue: a tier nothing reaches is
// never shown, so the page cannot offer a filter that empties itself.
export const discountTiers = [10, 15, 20, 25, 30, 40, 50];
