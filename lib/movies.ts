// The rules Markaz Movies runs on. Nothing here reads the database, so the
// poster, the sheet and the route that records a purchase all share them.
export const RENTAL_DAYS = 30;

// The catalogue stores one price per title: what it costs to own. A rental is
// 40 per cent of that, rounded to the usual .99 and never under $1.99. It is
// the store's rule, applied here and nowhere else, so the price on the poster,
// in the sheet and in the record of the rental is always the same number, and
// it is always worked out on the server.
export const rentPrice = (price: number) =>
    price > 0 ? Math.max(1.99, Math.round(Number(price) * 0.4) - 0.01) : 0;

// The $1.99 floor meets the cheapest titles: a film that sells for $1.99 would
// "rent" for the same money, which is not a choice. Those are sold outright, and
// the rent price is never shown or accepted for them.
export const canRent = (price: number) => Number(price) > 0 && rentPrice(price) < Number(price);

// The rows the seeder fills, in the order the page shows them. The two priced
// rows are named after the band the seeder actually used, so the label cannot
// drift from the prices underneath it.
export const movieRows = [
    { row: "popular-now", label: "Popular this week" },
    { row: "deals-under-5", label: "Buy for under $5", description: "Yours to keep" },
    { row: "action-adventure", label: "Action and adventure" },
    { row: "featured-originals", label: "Acclaimed series" },
    { row: "mystery-thriller", label: "Mystery and thriller" },
    { row: "under-10-price-drops", label: "New releases under $10" },
    { row: "drama-movies", label: "Drama" },
];

// The seeder derives a badge from the release date and the vote average. "DEAL"
// is dropped: the price is already on the poster, so the badge would only repeat
// it in shoutier type.
const badgeLabels: Record<string, string> = {
    "NEW MOVIE": "New release",
    "NEW SERIES": "New series",
    "NEW SEASON": "New season",
    "MOST LIKED": "Highly rated",
};

export const badgeLabel = (badge: string) => badgeLabels[badge] || "";

export const daysLeft = (expiresAt: any) =>
    Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000);

export const rentalLive = (entry: any) =>
    entry.type === "rent" && new Date(entry.expiresAt).getTime() > Date.now();
