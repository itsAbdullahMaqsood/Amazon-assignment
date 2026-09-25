"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import { cn } from "./cn";

const pagesToShow = (page: number, count: number) => {
    if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, "…", count];
    if (page >= count - 3) return [1, "…", count - 4, count - 3, count - 2, count - 1, count];
    return [1, "…", page - 1, page, page + 1, "…", count];
};

// Previous · numbered pages · Next. Renders nothing for a single page.
const Pagination = ({ page, count, onChange, className = "" }: any) => {
    if (count <= 1) return null;

    const item = "flex h-9 min-w-9 items-center justify-center rounded-control px-2 text-sm tabular cursor-pointer";

    return (
        <nav aria-label="Pages" className={cn("flex justify-center", className)}>
            <ul className="flex items-center gap-1">
                <li>
                    <button
                        type="button"
                        onClick={() => page > 1 && onChange(page - 1)}
                        disabled={page <= 1}
                        aria-label="Previous page"
                        className={cn(item, "text-fg hover:bg-surface-muted disabled:text-fg-subtle disabled:hover:bg-transparent disabled:cursor-not-allowed")}
                    >
                        <ChevronLeftIcon className="h-4 w-4" />
                    </button>
                </li>

                {pagesToShow(page, count).map((entry, i) =>
                    entry === "…" ? (
                        <li key={`gap-${i}`} className="px-1 text-fg-subtle">
                            …
                        </li>
                    ) : (
                        <li key={entry}>
                            <button
                                type="button"
                                onClick={() => onChange(entry)}
                                aria-current={entry === page ? "page" : undefined}
                                className={cn(item, entry === page ? "bg-ink-900 font-medium text-fg-inverse" : "text-fg hover:bg-surface-muted")}
                            >
                                {entry}
                            </button>
                        </li>
                    )
                )}

                <li>
                    <button
                        type="button"
                        onClick={() => page < count && onChange(page + 1)}
                        disabled={page >= count}
                        aria-label="Next page"
                        className={cn(item, "text-fg hover:bg-surface-muted disabled:text-fg-subtle disabled:hover:bg-transparent disabled:cursor-not-allowed")}
                    >
                        <ChevronRightIcon className="h-4 w-4" />
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination;
