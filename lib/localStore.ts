// Per-browser state for the simulated membership, device and watchlist screens.
// Nothing here touches the database: these are the bits of Amazon's account area
// that would be user state, kept in localStorage so the pages behave for a
// signed-out visitor too.
//
// The store is shaped for useSyncExternalStore, which is what lets the reading
// components stay lint-clean: the snapshot is cached against the raw string, so
// it keeps its identity until the stored value actually changes, and the server
// snapshot is a frozen fallback so hydration matches the empty state.
export const createLocalStore = <T,>(key: string, fallback: T) => {
    let raw: string | null = null;
    let snapshot: T = fallback;

    const listeners = new Set<() => void>();

    const emit = () => {
        listeners.forEach((listener) => listener());
    };

    const readRaw = () => {
        try {
            return window.localStorage.getItem(key);
        } catch {
            return null;
        }
    };

    const getSnapshot = (): T => {
        if (typeof window === "undefined") {
            return fallback;
        }

        const next = readRaw();

        if (next !== raw) {
            raw = next;

            try {
                const parsed = next === null ? fallback : JSON.parse(next);
                snapshot = parsed === null || parsed === undefined ? fallback : parsed;
            } catch {
                snapshot = fallback;
            }
        }

        return snapshot;
    };

    const getServerSnapshot = (): T => fallback;

    const subscribe = (listener: () => void) => {
        listeners.add(listener);
        window.addEventListener("storage", listener);

        return () => {
            listeners.delete(listener);
            window.removeEventListener("storage", listener);
        };
    };

    const set = (value: T | ((current: T) => T)) => {
        const next = typeof value === "function" ? (value as any)(getSnapshot()) : value;

        try {
            window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
            // Private browsing or a full quota: the screen keeps working, the
            // change simply does not survive the reload.
        }

        emit();
    };

    return { key, subscribe, getSnapshot, getServerSnapshot, set };
};

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

// Formatted from the ISO parts rather than through the Intl calendar, so a date
// rendered on the server and re-rendered in the browser cannot disagree.
export const formatDate = (value: string) => {
    if (!value) {
        return "";
    }

    const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);

    if (!year || !month || !day) {
        return "";
    }

    return `${MONTHS[month - 1]} ${day}, ${year}`;
};

export const today = () => new Date().toISOString().slice(0, 10);

// Clamped to the end of the shorter month, so January 31 plus one month is
// February 28 rather than JavaScript's March 3.
export const addMonths = (from: string, months: number) => {
    const date = new Date(`${from}T00:00:00Z`);
    const day = date.getUTCDate();

    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() + months);

    const lastDay = new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)
    ).getUTCDate();

    date.setUTCDate(Math.min(day, lastDay));

    return date.toISOString().slice(0, 10);
};

export const addDays = (from: string, days: number) => {
    const date = new Date(`${from}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);

    return date.toISOString().slice(0, 10);
};

export const daysUntil = (value: string) => {
    const target = new Date(`${String(value).slice(0, 10)}T00:00:00Z`).getTime();
    const now = new Date(`${today()}T00:00:00Z`).getTime();

    return Math.round((target - now) / 86400000);
};
