"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const pagesToShow = (page: number, count: number) => {
    if (count <= 7) {
        return Array.from({ length: count }, (_, i) => i + 1);
    }

    if (page <= 4) {
        return [1, 2, 3, 4, 5, "...", count];
    }

    if (page >= count - 3) {
        return [1, "...", count - 4, count - 3, count - 2, count - 1, count];
    }

    return [1, "...", page - 1, page, page + 1, "...", count];
};

const Pagination = ({ page, count, onChange }: any) => {
    if (count <= 1) {
        return null;
    }

    const base =
        "w-9 h-9 flex items-center justify-center border border-slate-300 rounded cursor-pointer";

    return (
        <nav aria-label="Pagination" className="w-full my-4 flex items-end justify-end">
            <ul className="flex items-center gap-1">
                <li>
                    <button
                        onClick={() => page > 1 && onChange(page - 1)}
                        disabled={page <= 1}
                        aria-label="Previous page"
                        className={`${base} ${
                            page <= 1 ? "text-slate-300 cursor-not-allowed" : "hover:bg-slate-200"
                        }`}
                    >
                        <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                </li>

                {pagesToShow(page, count).map((entry, i) =>
                    entry === "..." ? (
                        <li key={`gap-${i}`} className="w-9 h-9 flex items-center justify-center">
                            …
                        </li>
                    ) : (
                        <li key={entry}>
                            <button
                                onClick={() => onChange(entry)}
                                aria-current={entry === page ? "page" : undefined}
                                className={`${base} ${
                                    entry === page
                                        ? "bg-ink-800 text-white"
                                        : "hover:bg-slate-200"
                                }`}
                            >
                                {entry}
                            </button>
                        </li>
                    )
                )}

                <li>
                    <button
                        onClick={() => page < count && onChange(page + 1)}
                        disabled={page >= count}
                        aria-label="Next page"
                        className={`${base} ${
                            page >= count ? "text-slate-300 cursor-not-allowed" : "hover:bg-slate-200"
                        }`}
                    >
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination;
