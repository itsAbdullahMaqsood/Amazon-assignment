import { StarIcon } from "@heroicons/react/24/solid";

import { cn } from "./cn";

// Read-only stars with the number beside them. Fractions are drawn as a clipped
// star, so 4.3 looks like 4.3 rather than 4 or 4.5.
const Rating = ({ value, count, size = "sm", href, showValue = true, className = "" }: any) => {
    const rating = Number(value) || 0;
    const star = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

    const stars = (
        <span className="inline-flex" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((index) => {
                const fill = Math.min(Math.max(rating - index, 0), 1);

                return (
                    <span key={index} className="relative inline-flex">
                        <StarIcon className={cn(star, "text-line-strong")} />
                        <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                            <StarIcon className={cn(star, "text-star")} />
                        </span>
                    </span>
                );
            })}
        </span>
    );

    const label = `${rating.toFixed(1)} out of 5${count !== undefined ? `, ${count} review${count === 1 ? "" : "s"}` : ""}`;
    const content = (
        <>
            {stars}
            {showValue && <span className="font-medium text-fg">{rating.toFixed(1)}</span>}
            {count !== undefined && <span className="text-fg-muted">({count})</span>}
        </>
    );
    const classes = cn("inline-flex items-center gap-1", size === "sm" ? "text-xs" : "text-sm", className);

    if (href) {
        return (
            <a href={href} aria-label={label} className={cn(classes, "hover:underline")}>
                {content}
            </a>
        );
    }

    return (
        <span role="img" aria-label={label} className={classes}>
            {content}
        </span>
    );
};

export default Rating;
