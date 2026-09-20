"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

import useBrowseQuery from "@/components/browse/useBrowseQuery";
import { parsePriceRange, ratingTiers } from "./filters";

// One dropdown, closed by a click anywhere outside it or by Escape.
const Dropdown = ({ label, active, children }: any) => {
    const [open, setOpen] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        const onClick = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onClick);

        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onClick);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative">
            <button
                onClick={() => setOpen(!open)}
                aria-haspopup="true"
                aria-expanded={open}
                className={`flex items-center gap-2 h-11 px-4 rounded-lg border bg-white text-sm cursor-pointer ${
                    active ? "border-2 border-[#0F5FA6] font-bold" : "border-slate-400 hover:bg-slate-50"
                }`}
            >
                {label}
                <ChevronDownIcon className="w-4 h-4 stroke-2" />
            </button>

            {open && (
                <div className="absolute left-0 top-full mt-1 z-30 w-[260px] bg-white border border-slate-300 rounded-lg shadow-lg p-4">
                    {children(() => setOpen(false))}
                </div>
            )}
        </div>
    );
};

const FilterBar = ({ current }: any) => {
    const { filter } = useBrowseQuery();
    const { min, max } = parsePriceRange(current.price);
    const rating = current.rating || "";

    const priceLabel =
        min !== undefined || max !== undefined
            ? `$${min ?? 0} – ${max !== undefined ? `$${max}` : "Any"}`
            : "Price ($)";

    const ratingLabel = ratingTiers.find((tier) => tier.value === rating)?.label || "& Up";

    return (
        <div className="flex flex-wrap items-center gap-3 py-4">
            <Dropdown label={priceLabel} active={Boolean(current.price)}>
                {(close: any) => (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const data = new FormData(e.currentTarget as HTMLFormElement);
                            const low = String(data.get("min") || "");
                            const high = String(data.get("max") || "");

                            filter({ price: low || high ? `${low}_${high}` : "" });
                            close();
                        }}
                    >
                        <p className="font-bold text-sm mb-2">Price</p>

                        <div className="flex items-center gap-2">
                            <input
                                name="min"
                                type="number"
                                min={0}
                                defaultValue={min ?? ""}
                                placeholder="Min"
                                aria-label="Minimum price"
                                className="w-full border border-slate-400 rounded px-2 py-1 text-sm"
                            />
                            <span className="text-slate-500">to</span>
                            <input
                                name="max"
                                type="number"
                                min={0}
                                defaultValue={max ?? ""}
                                placeholder="Max"
                                aria-label="Maximum price"
                                className="w-full border border-slate-400 rounded px-2 py-1 text-sm"
                            />
                        </div>

                        <div className="flex items-center gap-3 mt-3">
                            <button
                                type="submit"
                                className="px-4 py-1 rounded-full bg-[#FFD814] hover:bg-[#F7CA00] text-sm cursor-pointer"
                            >
                                Go
                            </button>

                            {current.price && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        filter({ price: "" });
                                        close();
                                    }}
                                    className="text-sm text-[#007185] hover:underline cursor-pointer"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </form>
                )}
            </Dropdown>

            <Dropdown
                label={
                    <span className="flex items-center gap-1">
                        <span className="flex">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <StarIcon
                                    key={i}
                                    className={`w-4 h-4 ${
                                        i < Number(rating || 4) ? "text-[#FF9900]" : "text-slate-300"
                                    }`}
                                />
                            ))}
                        </span>
                        {ratingLabel.replace(/^\d \w+ /, "")}
                    </span>
                }
                active={Boolean(rating)}
            >
                {(close: any) => (
                    <div>
                        <p className="font-bold text-sm mb-2">Customer Reviews</p>

                        {ratingTiers.map((tier) => (
                            <button
                                key={tier.value}
                                onClick={() => {
                                    filter({ rating: rating === tier.value ? "" : tier.value });
                                    close();
                                }}
                                aria-pressed={rating === tier.value}
                                className={`block w-full text-left text-sm py-1 hover:text-[#C7511F] cursor-pointer ${
                                    rating === tier.value ? "font-bold" : ""
                                }`}
                            >
                                {tier.label}
                            </button>
                        ))}
                    </div>
                )}
            </Dropdown>
        </div>
    );
};

export default FilterBar;
