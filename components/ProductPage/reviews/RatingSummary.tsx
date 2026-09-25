"use client";

import StarRating from "@/components/shared/StarRating";
import { RATINGS, countFor } from "./reviewUtils";

// `ratings` is the 5→1 histogram the product page already computes; the counts are
// derived here from the reviews that are on the page anyway.
const RatingSummary = ({ average, reviews, ratings, filter, onFilter }: any) => {
    const total = reviews.length;

    return (
        <div>
            <div className="flex items-center gap-2">
                <StarRating value={average} />
                <span className="text-lg">
                    {total ? `${Number(average).toFixed(1)} out of 5` : "No ratings yet"}
                </span>
            </div>

            <p className="text-sm text-slate-600 mt-1">
                {total} global rating{total === 1 ? "" : "s"}
            </p>

            <div className="mt-4 space-y-1.5">
                {RATINGS.map((rating, i) => {
                    const percentage = Math.round(Number(ratings?.[i]?.percentage) || 0);
                    const active = filter === rating;
                    const count = countFor(reviews, rating);

                    return (
                        <button
                            key={rating}
                            type="button"
                            onClick={() => onFilter(active ? 0 : rating)}
                            disabled={!total}
                            aria-pressed={active}
                            aria-label={
                                active
                                    ? `Clear the ${rating} star filter`
                                    : `Show only ${rating} star reviews, ${count} of ${total}`
                            }
                            className={`group w-full flex items-center gap-2 text-sm rounded px-1 py-0.5 ${
                                total ? "cursor-pointer hover:bg-slate-100" : "cursor-default"
                            } ${active ? "bg-slate-100 font-semibold" : ""}`}
                        >
                            <span className="w-14 shrink-0 text-left text-accent-ink group-hover:text-accent-deep group-hover:underline">
                                {rating} star
                            </span>

                            <span className="grow h-5 rounded-sm bg-surface-muted border border-slate-400 overflow-hidden">
                                <span
                                    className="block h-full bg-linear-to-r from-accent to-accent"
                                    style={{ width: `${percentage}%` }}
                                />
                            </span>

                            <span className="w-10 shrink-0 text-right text-accent-ink group-hover:text-accent-deep group-hover:underline">
                                {percentage}%
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default RatingSummary;
