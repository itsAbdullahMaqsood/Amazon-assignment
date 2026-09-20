"use client";

import { useState } from "react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

const brackets = [
    { height: "15%", min: "0", max: "10", label: "Check out products under 10$" },
    { height: "30%", min: "10", max: "50", label: "Check out products between 10$ and 50$" },
    { height: "50%", min: "50", max: "100", label: "Check out products between 50$ and 100$" },
    { height: "75%", min: "100", max: "500", label: "Check out products between 100$ and 500$" },
    { height: "100%", min: "500", max: "", label: "Check out products for more than 500$" },
];

const sortOptions = [
    { label: "Recommend", value: "" },
    { label: "Most Popular", value: "popular" },
    { label: "New Arrivals", value: "newest" },
    { label: "Top Selling", value: "topSelling" },
    { label: "Top Reviewed", value: "topReviewed" },
    { label: "Price (Low to High)", value: "priceLowToHight" },
    { label: "Price (High to Low)", value: "priceHighToLow" },
];

const HeadingFilter = ({ current, filter, priceHandler, multiPriceHandler }: any) => {
    const [minValue, maxValue] = String(current.price || "").split("_");
    const [open, setOpen] = useState<boolean>(false);

    const activeSort = sortOptions.find((option) => option.value === (current.sort || ""));

    return (
        <div className="w-full flex flex-col md:flex-row md:items-end gap-x-6 gap-y-3">
            <div className="flex items-end gap-2">
                <span className="font-semibold">Price:</span>
                <label className="sr-only" htmlFor="price-min">
                    Minimum price
                </label>
                <input
                    id="price-min"
                    type="number"
                    defaultValue={minValue || ""}
                    onChange={(e) => priceHandler(e.target.value, "min")}
                    placeholder="min"
                    className="w-[80px] border border-slate-300 rounded px-2 py-1"
                />
                <span>-</span>
                <label className="sr-only" htmlFor="price-max">
                    Maximum price
                </label>
                <input
                    id="price-max"
                    type="number"
                    defaultValue={maxValue || ""}
                    onChange={(e) => priceHandler(e.target.value, "max")}
                    placeholder="max"
                    className="w-[80px] border border-slate-300 rounded px-2 py-1"
                />
            </div>

            <div className="flex items-end gap-1 h-[34px]">
                {brackets.map((bracket) => (
                    <button
                        key={bracket.height}
                        onClick={() => multiPriceHandler(bracket.min, bracket.max)}
                        className="tooltip_btn group"
                        aria-label={bracket.label}
                    >
                        <span style={{ height: bracket.height }} />
                        <span className="tooltip_bubble group-hover:visible group-hover:opacity-100">
                            {bracket.label}
                        </span>
                    </button>
                ))}
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={current.shipping === "0"}
                    onChange={() => filter({ shipping: current.shipping === "0" ? "" : "0" })}
                    className="cursor-pointer"
                />
                Free Shipping
            </label>

            <label className="flex items-center gap-1 cursor-pointer">
                <input
                    type="checkbox"
                    checked={current.rating === "4"}
                    onChange={() => filter({ rating: current.rating === "4" ? "" : "4" })}
                    className="cursor-pointer mr-1"
                />
                {[0, 1, 2, 3].map((i) => (
                    <StarIcon key={i} className="w-4 h-4 fill-[#FACF19]" />
                ))}
                <span className="text-sm">&amp; up</span>
            </label>

            <div
                className="dropdown_sortby ml-auto"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
            >
                <span className="font-semibold mr-2">Sort by:</span>

                <button
                    onClick={() => setOpen(!open)}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    className="flex items-center cursor-pointer"
                >
                    {activeSort?.label}
                    <ChevronDownIcon className="w-4 h-4 ml-1" />
                </button>

                {open && (
                    <ul role="listbox" aria-label="Sort products">
                        {sortOptions.map((option) => (
                            <li
                                key={option.label}
                                role="option"
                                aria-selected={option.value === (current.sort || "")}
                                tabIndex={0}
                                onClick={() => {
                                    filter({ sort: option.value });
                                    setOpen(false);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        filter({ sort: option.value });
                                        setOpen(false);
                                    }
                                }}
                                className="flex items-center gap-2"
                            >
                                {option.value === (current.sort || "") && (
                                    <CheckIcon className="w-4 h-4" />
                                )}
                                {option.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default HeadingFilter;
