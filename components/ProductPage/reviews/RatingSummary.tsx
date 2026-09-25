"use client";

import Rating from "@/components/ui/Rating";
import { cn } from "@/components/ui/cn";
import { RATINGS, countFor } from "./reviewUtils";

// The average, then a bar per star that doubles as a filter: tap "2 star" to
// read only the two-star reviews.
const RatingSummary = ({ average, reviews, filter, onFilter }: any) => {
    const total = reviews.length;

    return (
        <div>
            <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-semibold tabular">{total ? Number(average).toFixed(1) : "–"}</span>
                <span className="text-fg-muted">out of 5</span>
            </div>
            {total > 0 && <Rating value={average} size="md" showValue={false} className="mt-1" />}
            <p className="mt-1 text-sm text-fg-muted">
                {total} review{total === 1 ? "" : "s"}
            </p>

            <div className="mt-4 space-y-1">
                {RATINGS.map((rating) => {
                    const count = countFor(reviews, rating);
                    const percentage = total ? Math.round((count * 100) / total) : 0;
                    const active = filter === rating;

                    return (
                        <button
                            key={rating}
                            type="button"
                            onClick={() => onFilter(active ? 0 : rating)}
                            disabled={!count && !active}
                            aria-pressed={active}
                            aria-label={active ? `Show all ratings` : `Show only ${rating} star reviews, ${count} of ${total}`}
                            className={cn(
                                "flex w-full items-center gap-3 rounded-control px-1.5 py-1 text-sm transition-colors",
                                count ? "cursor-pointer hover:bg-surface-muted" : "cursor-default opacity-60",
                                active && "bg-accent-soft"
                            )}
                        >
                            <span className="w-12 shrink-0 text-left text-fg-muted">{rating} star</span>
                            <span className="h-2 grow overflow-hidden rounded-full bg-surface-muted">
                                <span className="block h-full rounded-full bg-star" style={{ width: `${percentage}%` }} />
                            </span>
                            <span className="w-9 shrink-0 text-right text-fg-muted tabular">{percentage}%</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default RatingSummary;
