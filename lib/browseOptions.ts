// Shared by the browse page (server) and its sort control (client).
export const sortOptions = [
    { value: "relevance", label: "Best match", searchOnly: true },
    { value: "popular", label: "Most popular" },
    { value: "rating", label: "Top rated" },
    { value: "newest", label: "Newest" },
    { value: "price-asc", label: "Price: low to high" },
    { value: "price-desc", label: "Price: high to low" },
];
