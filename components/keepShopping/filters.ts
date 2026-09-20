// Client-safe filter vocabulary. It stays out of lib/keepShopping.ts so the
// browser bundle never reaches the model layer that module shapes data from.

// The tabs above the grid. `value` is what lands in ?tab=, and the sort each one
// implies is applied by the page that queries for it.
export const keepShoppingTabs = [
    { label: "For you", value: "for-you" },
    { label: "Deals", value: "deals" },
    { label: "Best Sellers", value: "best-sellers" },
    { label: "Bought together", value: "bought-together" },
];

export const ratingTiers = [
    { label: "4 Stars & Up", value: "4" },
    { label: "3 Stars & Up", value: "3" },
    { label: "2 Stars & Up", value: "2" },
    { label: "1 Star & Up", value: "1" },
];

// Price arrives as `min_max`; an open end is left undefined so the caller can
// drop it from the Mongo range.
export const parsePriceRange = (value: string) => {
    const [min, max] = String(value || "").split("_");

    return {
        min: min === "" || min === undefined ? undefined : Number(min),
        max: max === "" || max === undefined ? undefined : Number(max),
    };
};
