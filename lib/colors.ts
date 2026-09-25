// Variants store a swatch colour as hex and nothing else. These names let the
// product page and cart say "Colour: Sand" instead of showing an unlabelled dot.
// The first block is the palette scripts/seed.mjs assigns; anything else (an
// admin-entered colour) falls back to the nearest named hue.
const named: [string, string][] = [
    ["#1f2328", "Black"],
    ["#f4f4f2", "White"],
    ["#b3261e", "Red"],
    ["#2f5fa7", "Blue"],
    ["#2e7d4f", "Green"],
    ["#d9c7a3", "Sand"],
    ["#6b4fa0", "Purple"],
    ["#000000", "Black"],
    ["#ffffff", "White"],
    ["#808080", "Grey"],
    ["#c0392b", "Red"],
    ["#e67e22", "Orange"],
    ["#f1c40f", "Yellow"],
    ["#27ae60", "Green"],
    ["#2980b9", "Blue"],
    ["#8e44ad", "Purple"],
    ["#e84393", "Pink"],
    ["#8d6e63", "Brown"],
    ["#ecd297", "Sand"],
    ["#1a2a4a", "Navy"],
];

const toRgb = (hex: string) => {
    const clean = hex.replace("#", "");
    const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean.slice(0, 6);
    const value = parseInt(full, 16);

    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

export const colorName = (value: any) => {
    const hex = String(value || "").trim().toLowerCase();

    if (!/^#?[0-9a-f]{3,8}$/.test(hex)) {
        // Already a word ("navy"), or nothing at all.
        return hex ? hex.charAt(0).toUpperCase() + hex.slice(1) : "";
    }

    const [r, g, b] = toRgb(hex);
    let best = named[0];
    let bestDistance = Infinity;

    for (const entry of named) {
        const [r2, g2, b2] = toRgb(entry[0]);
        const distance = (r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2;

        if (distance < bestDistance) {
            best = entry;
            bestDistance = distance;
        }
    }

    return best[1];
};

// A representative swatch for a colour name, for filters that list names.
export const swatchFor = (name: string) => named.find((entry) => entry[1] === name)?.[0] || "";
