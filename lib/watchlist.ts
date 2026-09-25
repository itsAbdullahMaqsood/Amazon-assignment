import { addDays, createLocalStore, today } from "@/lib/localStore";

// Every title the viewer has saved or "bought" on /watchlist lives under this one
// key, so any other Prime Video screen can read the same list without a round
// trip: import { watchlistStore, addTitle, isSaved } from "@/lib/watchlist".
export const WATCHLIST_KEY = "markaz:watchlist";

// An entry is { id, addedAt, purchase } where `purchase` is null for a saved
// title and { type: "buy" | "rent", at, expiresAt } once it has been acquired.
// The Watchlist tab shows the entries without a purchase, the Purchases and
// rentals tab shows the rest.
export const RENTAL_DAYS = 30;

export const watchlistStore = createLocalStore<any[]>(WATCHLIST_KEY, []);

const asList = (value: any) => (Array.isArray(value) ? value : []);

export const savedTitles = (entries: any) =>
    asList(entries).filter((entry: any) => entry && entry.id && !entry.purchase);

export const purchasedTitles = (entries: any) =>
    asList(entries).filter((entry: any) => entry && entry.id && entry.purchase);

export const isSaved = (entries: any, id: string) =>
    savedTitles(entries).some((entry: any) => entry.id === id);

export const addTitle = (id: string) => {
    watchlistStore.set((current: any) => {
        if (asList(current).some((entry: any) => entry.id === id)) {
            return asList(current);
        }

        return [{ id, addedAt: today(), purchase: null }, ...asList(current)];
    });
};

export const removeTitle = (id: string) => {
    watchlistStore.set((current: any) => asList(current).filter((entry: any) => entry.id !== id));
};

export const toggleTitle = (id: string) => {
    const current = watchlistStore.getSnapshot();

    if (isSaved(current, id)) {
        removeTitle(id);
    } else {
        addTitle(id);
    }
};

// A rental keeps its expiry date so the Purchases tab can count down to it; a
// purchase has none, which is what makes it "yours to keep".
export const acquireTitle = (id: string, type: "buy" | "rent") => {
    const at = today();
    const purchase = { type, at, expiresAt: type === "rent" ? addDays(at, RENTAL_DAYS) : "" };

    watchlistStore.set((current: any) => {
        const list = asList(current);
        const known = list.some((entry: any) => entry.id === id);

        return known
            ? list.map((entry: any) => (entry.id === id ? { ...entry, purchase } : entry))
            : [{ id, addedAt: at, purchase }, ...list];
    });
};
