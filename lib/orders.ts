// The time ranges behind the "orders placed in" dropdown, and the query each
// one turns into. Values live in the URL, so they stay short and stable.
export const timeRanges = () => {
    const year = new Date().getFullYear();

    return [
        { value: "30d", label: "last 30 days" },
        { value: "3m", label: "past 3 months" },
        { value: "6m", label: "past 6 months" },
        ...[0, 1, 2].map((back) => ({ value: String(year - back), label: String(year - back) })),
    ];
};

export const DEFAULT_RANGE = "3m";

const monthsAgo = (months: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() - months);

    return date;
};

// A createdAt clause for one range value; an unknown value falls back to the default.
export const rangeClause = (value: string) => {
    if (/^\d{4}$/.test(value)) {
        const year = Number(value);

        return { $gte: new Date(year, 0, 1), $lt: new Date(year + 1, 0, 1) };
    }

    const months: any = { "30d": 1, "3m": 3, "6m": 6 };

    return { $gte: monthsAgo(months[value] || 3) };
};

export const rangeLabel = (value: string) =>
    timeRanges().find((range) => range.value === value)?.label || "past 3 months";

// The sentence Amazon puts in the empty state, e.g. "in the last 3 months".
export const rangeSentence = (value: string) => {
    const label = rangeLabel(value);

    return /^\d{4}$/.test(value) ? `in ${label}` : `in the ${label.replace("past", "last")}`;
};

// Where the empty state's "View orders in ..." link points: the current year,
// unless that is already what is being shown.
export const fallbackRange = (value: string) => {
    const year = new Date().getFullYear();

    return value === String(year) ? String(year - 1) : String(year);
};

export const tabs = [
    { label: "Orders", value: "" },
    { label: "Buy Again", value: "buy-again" },
    { label: "Not Yet Shipped", value: "not-shipped" },
    { label: "Digital Orders", value: "digital" },
    { label: "Markaz Pay", value: "amazon-pay" },
];
