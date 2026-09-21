// No Amazon gift card artwork is reproduced here. Each tile is drawn from
// gradients and SVG shapes, with a plain-text wordmark instead of a logo.
const designs: Record<string, any> = {
    classic: { from: "#232f3e", to: "#37475a", ink: "#febd69", label: "Classic" },
    birthday: { from: "#7b2d6b", to: "#c1558b", ink: "#ffe3a3", label: "Happy Birthday" },
    thanks: { from: "#0b6b5f", to: "#2ea28d", ink: "#f4f0e2", label: "Thank You" },
    celebrate: { from: "#b2491c", to: "#f0a04b", ink: "#fff6e4", label: "Congratulations" },
    holiday: { from: "#14352a", to: "#2f6b4b", ink: "#f6e7c1", label: "Happy Holidays" },
    everyday: { from: "#2b3f7a", to: "#6f8ad6", ink: "#ffffff", label: "Just Because" },
};

export const giftCardDesigns = Object.keys(designs).map((key) => ({
    value: key,
    label: designs[key].label,
}));

const Ribbon = ({ ink }: any) => (
    <g stroke={ink} strokeWidth="2" fill="none" opacity="0.85">
        <path d="M0 42 H200" />
        <path d="M150 0 V120" />
        <path d="M150 42 c -14 -18 -30 -14 -30 -2 c 0 9 18 10 30 2 z" />
        <path d="M150 42 c 14 -18 30 -14 30 -2 c 0 9 -18 10 -30 2 z" />
    </g>
);

const Confetti = ({ ink }: any) => (
    <g fill={ink} opacity="0.55">
        {[
            [22, 26, 4],
            [48, 80, 3],
            [76, 34, 5],
            [104, 92, 3],
            [132, 22, 4],
            [166, 66, 3],
            [186, 100, 4],
            [60, 52, 2],
        ].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} />
        ))}
    </g>
);

// One card shape backs the buy grid and the balance panel: a gradient panel, a
// mark in the design's ink, the wordmark and the amount.
const GiftCardArt = ({ design = "classic", amount, className = "" }: any) => {
    const card = designs[design] || designs.classic;
    const gradientId = `gc-${design}`;

    return (
        <svg
            viewBox="0 0 200 120"
            role="img"
            aria-label={`${card.label} gift card design`}
            className={`w-full rounded-lg ${className}`}
        >
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={card.from} />
                    <stop offset="100%" stopColor={card.to} />
                </linearGradient>
            </defs>

            <rect width="200" height="120" rx="10" fill={`url(#${gradientId})`} />

            {design === "birthday" || design === "celebrate" ? (
                <Confetti ink={card.ink} />
            ) : (
                <Ribbon ink={card.ink} />
            )}

            <text x="16" y="34" fill={card.ink} fontSize="15" fontWeight="700">
                amazon
            </text>
            <text x="16" y="52" fill={card.ink} fontSize="9" opacity="0.85">
                {card.label}
            </text>

            {amount ? (
                <text x="16" y="104" fill={card.ink} fontSize="26" fontWeight="700">
                    ${amount}
                </text>
            ) : null}
        </svg>
    );
};

export default GiftCardArt;
