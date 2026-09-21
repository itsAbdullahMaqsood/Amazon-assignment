// Variant sizes arrive from the seed as "One Size", "S|M|L|XL", "128GB|256GB",
// "Each|2 lb" and so on. Only a variant with more than one row is a real choice,
// and the default is always the first row (the seed stores them ascending) —
// except for letter sizes, where the smallest letter is what Amazon preselects
// and the seed order cannot be relied on.
const LETTERS = ["xxs", "xs", "s", "small", "m", "medium", "l", "large", "xl", "xxl", "xxxl"];

const letterRank = (label: any) => LETTERS.indexOf(String(label || "").trim().toLowerCase());

export const hasSizeChoice = (sizes: any[]) => (sizes || []).length > 1;

export const defaultSizeIndex = (sizes: any[]) => {
    if (!sizes || sizes.length === 0) {
        return 0;
    }

    const ranks = sizes.map((s: any) => letterRank(s?.size));

    if (ranks.some((rank: number) => rank === -1)) {
        return 0;
    }

    return ranks.indexOf(Math.min(...ranks));
};

// The URL carries the size as an index; anything missing or unparseable falls
// back to the default rather than blocking the add-to-cart button.
export const resolveSizeIndex = (sizes: any[], param: any) => {
    const index = Number(param);

    if (param === undefined || param === null || param === "" || Number.isNaN(index)) {
        return defaultSizeIndex(sizes);
    }

    return index;
};
