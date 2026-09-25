// Shopping preferences live entirely in the browser: one localStorage key holds
// every switch on /profile/preferences, and anything in the app that wants to
// respect a preference reads it through the helpers at the bottom of this file.

export const PREFERENCES_KEY = "markaz_shopping_preferences";

export const sections = [
    {
        id: "language",
        icon: "LanguageIcon",
        title: "Language & currency",
        description: "What the site is written in and which currency prices are shown in.",
        choices: [
            {
                id: "language",
                label: "Language",
                hint: "Applies to page text and email from Markaz.",
                options: [
                    { value: "en-US", label: "English - EN" },
                    { value: "es-US", label: "Español - ES" },
                    { value: "fr-CA", label: "Français - FR" },
                    { value: "de-DE", label: "Deutsch - DE" },
                    { value: "ar-AE", label: "العربية - AR" },
                ],
            },
            {
                id: "currency",
                label: "Currency",
                hint: "Prices are converted at checkout using the day's rate.",
                options: [
                    { value: "USD", label: "$ USD - US Dollar" },
                    { value: "EUR", label: "€ EUR - Euro" },
                    { value: "GBP", label: "£ GBP - British Pound" },
                    { value: "CAD", label: "$ CAD - Canadian Dollar" },
                    { value: "PKR", label: "₨ PKR - Pakistani Rupee" },
                ],
            },
        ],
        toggles: [],
    },
    {
        id: "content",
        icon: "SparklesIcon",
        title: "Content & recommendations",
        description: "How much of what you browse is used to pick what you are shown.",
        choices: [],
        toggles: [
            {
                id: "useBrowsingHistory",
                label: "Use browsing history for recommendations",
                hint: "Turn this off and recommendations stop being built from the products you have opened.",
            },
            {
                id: "showRecentlyViewed",
                label: "Show recently viewed",
                hint: "Controls your browsing history and the rows built from it.",
            },
            {
                id: "purchaseRecommendations",
                label: "Use your purchases for recommendations",
                hint: "Items you have bought can suggest related products.",
            },
            {
                id: "showReviewsFirst",
                label: "Show reviews before product details",
                hint: "Puts customer reviews above the technical detail table.",
            },
        ],
    },
    {
        id: "communication",
        icon: "EnvelopeIcon",
        title: "Communication",
        description: "Messages that are not about an order you have already placed.",
        choices: [],
        toggles: [
            {
                id: "marketingEmail",
                label: "Marketing email",
                hint: "Deals, recommendations and seasonal campaigns.",
            },
            {
                id: "marketingSms",
                label: "Marketing SMS",
                hint: "Text messages about offers. Delivery updates are sent either way.",
            },
            {
                id: "priceDropAlerts",
                label: "Price drop alerts for saved items",
                hint: "Email when something on a list falls in price.",
            },
            {
                id: "sellerMessages",
                label: "Messages from sellers",
                hint: "Follow-up from sellers you have bought from.",
            },
        ],
    },
    {
        id: "accessibility",
        icon: "EyeIcon",
        title: "Accessibility",
        description: "Adjust how pages move and how large the text is.",
        choices: [],
        toggles: [
            {
                id: "reducedMotion",
                label: "Reduce motion",
                hint: "Stops carousels auto-advancing and removes non-essential animation.",
            },
            {
                id: "largerText",
                label: "Larger text",
                hint: "Increases the base font size across the store.",
            },
            {
                id: "alwaysShowCaptions",
                label: "Always show captions on video",
                hint: "Applies to Markaz Movies and product videos.",
            },
        ],
    },
    {
        id: "advertising",
        icon: "MegaphoneIcon",
        title: "Advertising preferences",
        description: "What Markaz may use to choose the adverts you are shown.",
        choices: [],
        toggles: [
            {
                id: "personalisedAds",
                label: "Show personalised adverts",
                hint: "Off means you still see adverts, just not chosen from your activity.",
            },
            {
                id: "adsFromThirdParties",
                label: "Use information from advertising partners",
                hint: "Data shared by sites that run Markaz adverts.",
            },
            {
                id: "interestBasedEmail",
                label: "Interest-based adverts in email",
                hint: "Adverts inside marketing email you already receive.",
            },
        ],
    },
];

// Everything defaults on except the advertising partner sharing, which is the
// one switch a privacy page should not opt you into.
const offByDefault = ["adsFromThirdParties", "reducedMotion", "largerText", "showReviewsFirst"];

export const defaultPreferences: any = sections.reduce(
    (acc: any, section: any) => {
        section.choices.forEach((choice: any) => {
            acc[choice.id] = choice.options[0].value;
        });
        section.toggles.forEach((toggle: any) => {
            acc[toggle.id] = !offByDefault.includes(toggle.id);
        });

        return acc;
    },
    { savedAt: "" }
);

export const parsePreferences = (raw: string) => {
    try {
        return { ...defaultPreferences, ...(raw ? JSON.parse(raw) : {}) };
    } catch {
        return { ...defaultPreferences };
    }
};

// The raw string is the external store's snapshot: strings compare by value, so
// useSyncExternalStore stays stable between renders without a cache.
export const preferencesSnapshot = () => {
    try {
        return window.localStorage.getItem(PREFERENCES_KEY) || "";
    } catch {
        return "";
    }
};

export const serverPreferencesSnapshot = () => "";

const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

export const subscribePreferences = (listener: () => void) => {
    listeners.add(listener);
    window.addEventListener("storage", notify);

    return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", notify);
    };
};

// The browsing-history switch is the one preference a server component has to
// honour (the product page records views), so it is mirrored into a cookie.
export const HISTORY_COOKIE = "amazon_browsing_history";

export const writePreferences = (values: any) => {
    const saved = { ...defaultPreferences, ...values, savedAt: new Date().toISOString() };

    try {
        window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(saved));
        document.cookie = `${HISTORY_COOKIE}=${saved.useBrowsingHistory === false ? "0" : "1"}; path=/; max-age=31536000; samesite=lax`;
    } catch {
        // Private browsing or blocked storage: the switches still work for this
        // page view, they just will not survive a reload.
    }

    notify();

    return saved;
};

// Read helpers for the rest of the app. Safe to call during an event handler or
// an effect on the client; they return the defaults anywhere else.
export const readPreferences = () => {
    if (typeof window === "undefined") {
        return { ...defaultPreferences };
    }

    return parsePreferences(preferencesSnapshot());
};

export const browsingHistoryEnabled = () => readPreferences().useBrowsingHistory !== false;

export const recentlyViewedEnabled = () => readPreferences().showRecentlyViewed !== false;
