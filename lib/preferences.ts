// The preferences this store can actually honour. Everything else Amazon offers
// here — language, currency, marketing email, advertising — either has no
// machinery behind it or describes something Markaz does not do, so it is not
// offered as a switch that records a value and changes nothing.

export const PREFERENCE_COOKIE = "markaz_prefs";

export const defaultPreferences = {
    useBrowsingHistory: true,
    reduceMotion: false,
    largerText: false,
};

export type Preferences = typeof defaultPreferences;

export const preferenceSwitches = [
    {
        id: "useBrowsingHistory",
        label: "Remember what I look at",
        hint: "Products you open are kept on your account and used for the rows built from them. Off, nothing new is recorded — what is already there stays until you clear it.",
        href: "/profile/recent",
        hrefLabel: "Your browsing history",
    },
    {
        id: "reduceMotion",
        label: "Reduce motion",
        hint: "Removes the transitions and hover animations across the store. Your device's own reduced-motion setting is respected either way.",
    },
    {
        id: "largerText",
        label: "Larger text",
        hint: "Raises the base text size across the store by about 12%. Everything is sized from it, so spacing grows with it.",
    },
];

// The preferences travel in one short cookie as well as on the account, so the
// server can render the first paint correctly — including for a signed-out
// visitor, who has no account to read.
export const encodePreferences = (values: any) => {
    const p = { ...defaultPreferences, ...values };

    return `h${p.useBrowsingHistory ? 1 : 0}m${p.reduceMotion ? 1 : 0}t${p.largerText ? 1 : 0}`;
};

export const decodePreferences = (raw: any): Preferences => {
    const value = String(raw || "");
    const read = (key: string, fallback: boolean) => {
        const match = value.match(new RegExp(`${key}([01])`));

        return match ? match[1] === "1" : fallback;
    };

    return {
        useBrowsingHistory: read("h", defaultPreferences.useBrowsingHistory),
        reduceMotion: read("m", defaultPreferences.reduceMotion),
        largerText: read("t", defaultPreferences.largerText),
    };
};
