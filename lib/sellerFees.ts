// Referral-fee table behind the /sell calculator. The percentages follow Amazon's
// published US referral fee schedule closely enough to be believable; they are
// reference data for a coursework clone, not a quote.
//
// Amazon uses two shapes of tier and this table keeps both. "marginal" splits the
// price across the bands, so a $300 necklace pays 20% on the first $250 and 5% on
// the rest. "threshold" picks one rate for the whole price from the band it falls
// in, which is how apparel and beauty are charged.

export const PROFESSIONAL_MONTHLY = 39.99;
export const INDIVIDUAL_PER_ITEM = 0.99;

// Amazon charges whichever is greater, the percentage or this floor.
export const MINIMUM_REFERRAL_FEE = 0.3;

// Media categories carry a flat closing fee on top of the referral fee.
const MEDIA_CLOSING_FEE = 1.8;

export const categories: any[] = [
    { id: "home", label: "Home & Kitchen", tiers: [{ percent: 15 }] },
    {
        id: "beauty",
        label: "Beauty & Personal Care",
        mode: "threshold",
        tiers: [
            { upTo: 10, percent: 8 },
            { percent: 15 },
        ],
    },
    {
        id: "clothing",
        label: "Clothing & Accessories",
        mode: "threshold",
        tiers: [
            { upTo: 15, percent: 5 },
            { upTo: 20, percent: 10 },
            { percent: 17 },
        ],
    },
    { id: "electronics", label: "Consumer Electronics", tiers: [{ percent: 8 }] },
    {
        id: "electronics-accessories",
        label: "Electronics Accessories",
        tiers: [
            { upTo: 100, percent: 15 },
            { percent: 8 },
        ],
    },
    { id: "computers", label: "Computers", tiers: [{ percent: 8 }] },
    { id: "cameras", label: "Camera & Photo", tiers: [{ percent: 8 }] },
    {
        id: "furniture",
        label: "Furniture",
        tiers: [
            { upTo: 200, percent: 15 },
            { percent: 10 },
        ],
    },
    {
        id: "grocery",
        label: "Grocery & Gourmet Food",
        mode: "threshold",
        tiers: [
            { upTo: 15, percent: 8 },
            { percent: 15 },
        ],
    },
    {
        id: "health",
        label: "Health & Household",
        mode: "threshold",
        tiers: [
            { upTo: 10, percent: 8 },
            { percent: 15 },
        ],
    },
    {
        id: "jewelry",
        label: "Jewelry",
        tiers: [
            { upTo: 250, percent: 20 },
            { percent: 5 },
        ],
    },
    {
        id: "watches",
        label: "Watches",
        tiers: [
            { upTo: 1500, percent: 16 },
            { percent: 3 },
        ],
    },
    { id: "toys", label: "Toys & Games", tiers: [{ percent: 15 }] },
    { id: "sports", label: "Sports & Outdoors", tiers: [{ percent: 15 }] },
    { id: "tools", label: "Tools & Home Improvement", tiers: [{ percent: 15 }] },
    { id: "office", label: "Office Products", tiers: [{ percent: 15 }] },
    { id: "pet", label: "Pet Supplies", tiers: [{ percent: 15 }] },
    { id: "baby", label: "Baby Products", tiers: [{ percent: 15 }] },
    { id: "industrial", label: "Industrial & Scientific", tiers: [{ percent: 12 }] },
    { id: "automotive", label: "Automotive & Powersports", tiers: [{ percent: 12 }] },
    { id: "books", label: "Books", tiers: [{ percent: 15 }], closingFee: MEDIA_CLOSING_FEE },
    { id: "music", label: "Music, Video & DVD", tiers: [{ percent: 15 }], closingFee: MEDIA_CLOSING_FEE },
    { id: "device-accessories", label: "Amazon Device Accessories", tiers: [{ percent: 45 }] },
    { id: "gift-cards", label: "Gift Cards", tiers: [{ percent: 20 }] },
];

export const findCategory = (id: string) =>
    categories.find((category) => category.id === id) || categories[0];

// Banded or marginal depending on the category, then floored at the minimum.
export const referralFee = (categoryId: string, price: number) => {
    const amount = Math.max(0, Number(price) || 0);

    if (amount === 0) {
        return 0;
    }

    const category = findCategory(categoryId);
    const { tiers } = category;

    if (category.mode === "threshold") {
        const band =
            tiers.find((tier: any) => tier.upTo && amount <= tier.upTo) || tiers[tiers.length - 1];

        return Math.max((amount * band.percent) / 100, MINIMUM_REFERRAL_FEE);
    }

    let remaining = amount;
    let previousCeiling = 0;
    let fee = 0;

    for (const tier of tiers) {
        const band = tier.upTo ? Math.max(0, tier.upTo - previousCeiling) : remaining;
        const taxed = Math.min(remaining, band);

        fee += (taxed * tier.percent) / 100;
        remaining -= taxed;
        previousCeiling = tier.upTo || previousCeiling;

        if (remaining <= 0) {
            break;
        }
    }

    return Math.max(fee, MINIMUM_REFERRAL_FEE);
};

// The blended rate the seller actually pays, which is what the widget shows next
// to the category — a tiered category's headline percentage is misleading alone.
export const effectiveRate = (categoryId: string, price: number) => {
    const amount = Number(price) || 0;

    return amount > 0 ? (referralFee(categoryId, amount) / amount) * 100 : 0;
};

// `plan` is "individual" or "professional". The Professional subscription is a
// monthly cost, so it only turns into a per-unit number once you say how many
// units a month you expect to sell.
export const estimate = ({ categoryId, price, plan, unitsPerMonth }: any) => {
    const itemPrice = Math.max(0, Number(price) || 0);
    const units = Math.max(1, Number(unitsPerMonth) || 1);
    const category = findCategory(categoryId);

    const referral = referralFee(categoryId, itemPrice);
    const closing = category.closingFee || 0;
    const perItem = plan === "professional" ? 0 : INDIVIDUAL_PER_ITEM;
    const subscriptionPerUnit = plan === "professional" ? PROFESSIONAL_MONTHLY / units : 0;

    const fees = referral + closing + perItem + subscriptionPerUnit;
    const payout = itemPrice - fees;

    return {
        itemPrice,
        units,
        referral,
        closing,
        perItem,
        subscriptionPerUnit,
        fees,
        payout,
        monthlyPayout: payout * units,
        rate: effectiveRate(categoryId, itemPrice),
        margin: itemPrice > 0 ? (payout / itemPrice) * 100 : 0,
    };
};

// Below this many units a month the $0.99 per-item fee is cheaper than the
// subscription, which is the one number every new seller asks about.
export const planBreakEvenUnits = Math.ceil(PROFESSIONAL_MONTHLY / INDIVIDUAL_PER_ITEM);

export const money = (value: number) =>
    `$${(Math.round((Number(value) || 0) * 100) / 100).toFixed(2)}`;
