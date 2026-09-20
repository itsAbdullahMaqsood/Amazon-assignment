"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

import { discountTiers } from "@/lib/coupons";
import PriceSlider from "./PriceSlider";

const VISIBLE_DEPARTMENTS = 5;

const Radio = ({ name, checked, onChange, children }: any) => (
    <label className="flex items-center gap-2 text-sm py-1 cursor-pointer">
        <input
            type="radio"
            name={name}
            checked={checked}
            onChange={onChange}
            className="w-4 h-4 cursor-pointer accent-[#0F5FA6]"
        />
        {children}
    </label>
);

const CouponFilters = ({ categories, subCategories, current, ceiling, filter, onClear }: any) => {
    const [expanded, setExpanded] = useState<boolean>(false);

    const [minPrice, maxPrice] = String(current.price || "").split("_");
    const departments = expanded ? categories : categories.slice(0, VISIBLE_DEPARTMENTS);

    const activeChips = [
        { label: "Coupons", fixed: true },
        ...(current.category
            ? [
                  {
                      label:
                          categories.find((c: any) => c._id === current.category)?.name ||
                          "Department",
                      onRemove: () => filter({ category: "" }),
                  },
              ]
            : []),
        ...(current.sub
            ? [
                  {
                      label:
                          subCategories.find((s: any) => s._id === current.sub)?.name || "Aisle",
                      onRemove: () => filter({ sub: "" }),
                  },
              ]
            : []),
        ...(current.rating ? [{ label: "4 Stars & Up", onRemove: () => filter({ rating: "" }) }] : []),
        ...(current.discount
            ? [
                  {
                      label: `${current.discount}% off or more`,
                      onRemove: () => filter({ discount: "" }),
                  },
              ]
            : []),
    ];

    return (
        <aside aria-label="Coupon filters" className="text-sm">
            <h2 className="font-bold mb-2">Filtered by</h2>

            <div className="flex flex-wrap gap-2">
                {activeChips.map((chip: any) => (
                    <span
                        key={chip.label}
                        className="inline-flex items-center gap-1 border-2 border-[#0F5FA6] rounded-lg px-3 py-1.5 font-bold"
                    >
                        {chip.label}
                        {!chip.fixed && (
                            <button
                                onClick={chip.onRemove}
                                aria-label={`Remove ${chip.label} filter`}
                                className="font-normal cursor-pointer"
                            >
                                &times;
                            </button>
                        )}
                    </span>
                ))}
            </div>

            <button
                onClick={onClear}
                className="block mt-3 text-[#0F5FA6] hover:underline cursor-pointer"
            >
                Clear Filters
            </button>

            <section className="mt-6">
                <h3 className="font-bold mb-2">Department</h3>

                <Radio
                    name="department"
                    checked={!current.category}
                    onChange={() => filter({ category: "", sub: "" })}
                >
                    All
                </Radio>

                {departments.map((category: any) => (
                    <Radio
                        key={category._id}
                        name="department"
                        checked={current.category === category._id}
                        onChange={() => filter({ category: category._id, sub: "" })}
                    >
                        {category.name}
                    </Radio>
                ))}

                {categories.length > VISIBLE_DEPARTMENTS && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-1 mt-1 text-[#0F5FA6] hover:underline cursor-pointer"
                    >
                        {expanded ? (
                            <ChevronUpIcon className="w-4 h-4" />
                        ) : (
                            <ChevronDownIcon className="w-4 h-4" />
                        )}
                        See {expanded ? "less" : "more"}
                    </button>
                )}
            </section>

            <section className="mt-6">
                <h3 className="font-bold mb-2">Customer Reviews</h3>

                <Radio
                    name="reviews"
                    checked={!current.rating}
                    onChange={() => filter({ rating: "" })}
                >
                    All
                </Radio>

                <Radio
                    name="reviews"
                    checked={current.rating === "4"}
                    onChange={() => filter({ rating: "4" })}
                >
                    <span className="flex items-center gap-1">
                        <span className="flex">
                            {[0, 1, 2, 3].map((i) => (
                                <StarIcon key={i} className="w-4 h-4 text-[#FF9900]" />
                            ))}
                            <StarIcon className="w-4 h-4 text-slate-300" />
                        </span>
                        &amp; up
                    </span>
                </Radio>
            </section>

            <section className="mt-6">
                <h3 className="font-bold mb-2">Price</h3>

                <PriceSlider
                    key={current.price || "all"}
                    ceiling={ceiling}
                    min={Number(minPrice) || 0}
                    max={Number(maxPrice) || ceiling}
                    onCommit={(low: number, high: number) =>
                        filter({ price: low === 0 && high >= ceiling ? "" : `${low}_${high}` })
                    }
                />
            </section>

            <section className="mt-6">
                <h3 className="font-bold mb-2">Discount</h3>

                {discountTiers.map((tier) => (
                    <Radio
                        key={tier.label}
                        name="discount"
                        checked={(current.discount || "") === tier.value}
                        onChange={() => filter({ discount: tier.value })}
                    >
                        {tier.label}
                    </Radio>
                ))}
            </section>
        </aside>
    );
};

export default CouponFilters;
