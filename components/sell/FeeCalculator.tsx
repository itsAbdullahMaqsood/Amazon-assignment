"use client";

import { useState } from "react";

import {
    INDIVIDUAL_PER_ITEM,
    PROFESSIONAL_MONTHLY,
    categories,
    estimate,
    findCategory,
    money,
    planBreakEvenUnits,
} from "@/lib/sellerFees";

const Row = ({ label, value, hint, strong }: any) => (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-slate-200 last:border-b-0">
        <span className={strong ? "font-bold" : "text-slate-600"}>
            {label}
            {hint && <span className="block text-xs text-slate-500">{hint}</span>}
        </span>
        <span className={strong ? "font-bold text-lg" : "font-medium"}>{value}</span>
    </div>
);

// Everything is derived during render, so the figures move with the inputs
// without an effect anywhere.
const FeeCalculator = () => {
    const [categoryId, setCategoryId] = useState<string>("home");
    const [price, setPrice] = useState<string>("29.99");
    const [plan, setPlan] = useState<string>("professional");
    const [unitsPerMonth, setUnitsPerMonth] = useState<string>("50");

    const category = findCategory(categoryId);
    const result = estimate({ categoryId, price, plan, unitsPerMonth });
    const loss = result.payout < 0;

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white border border-slate-300 rounded-lg p-5">
                <div className="mb-4">
                    <label htmlFor="fee-category" className="block text-sm font-semibold mb-1">
                        Product category
                    </label>
                    <select
                        id="fee-category"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full text-sm p-2.5 rounded border border-slate-300 bg-white outline-none"
                    >
                        {categories.map((entry) => (
                            <option key={entry.id} value={entry.id}>
                                {entry.label}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                        {category.tiers.length === 1
                            ? `Flat ${category.tiers[0].percent}% referral fee.`
                            : category.mode === "threshold"
                              ? "Tiered referral fee — one rate applies to the whole price, chosen by the band the price falls in."
                              : "Tiered referral fee — each band of the price is charged at its own rate."}
                        {category.closingFee
                            ? ` Media items also carry a ${money(category.closingFee)} closing fee.`
                            : ""}
                    </p>
                </div>

                <div className="mb-4">
                    <label htmlFor="fee-price" className="block text-sm font-semibold mb-1">
                        Item price
                    </label>
                    <div className="flex items-center rounded border border-slate-300 px-2.5">
                        <span className="text-slate-500 text-sm">$</span>
                        <input
                            id="fee-price"
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full text-sm p-2.5 outline-none"
                        />
                    </div>
                </div>

                <fieldset className="mb-4">
                    <legend className="text-sm font-semibold mb-1">Selling plan</legend>

                    <div className="grid gap-2 sm:grid-cols-2">
                        {[
                            {
                                value: "individual",
                                label: "Individual",
                                hint: `${money(INDIVIDUAL_PER_ITEM)} per item sold`,
                            },
                            {
                                value: "professional",
                                label: "Professional",
                                hint: `${money(PROFESSIONAL_MONTHLY)} per month`,
                            },
                        ].map((option) => (
                            <label
                                key={option.value}
                                className={`flex items-start gap-2 p-3 rounded border cursor-pointer ${
                                    plan === option.value
                                        ? "border-amazon-blue_light bg-slate-50"
                                        : "border-slate-300"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="plan"
                                    value={option.value}
                                    checked={plan === option.value}
                                    onChange={(e) => setPlan(e.target.value)}
                                    className="mt-1"
                                />
                                <span className="text-sm">
                                    <span className="font-semibold block">{option.label}</span>
                                    <span className="text-slate-500 text-xs">{option.hint}</span>
                                </span>
                            </label>
                        ))}
                    </div>
                </fieldset>

                <div>
                    <label htmlFor="fee-units" className="block text-sm font-semibold mb-1">
                        Units you expect to sell each month
                    </label>
                    <input
                        id="fee-units"
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        value={unitsPerMonth}
                        onChange={(e) => setUnitsPerMonth(e.target.value)}
                        className="w-full text-sm p-2.5 rounded border border-slate-300 outline-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        Used to spread the Professional subscription across your sales. Above{" "}
                        {planBreakEvenUnits} units a month the Professional plan costs less than the
                        per-item fee.
                    </p>
                </div>
            </div>

            <div className="bg-slate-50 border border-slate-300 rounded-lg p-5">
                <h3 className="font-bold text-lg">Estimated payout</h3>
                <p className="text-sm text-slate-600 mb-3">
                    Per unit, before the cost of your product, shipping and any advertising.
                </p>

                <Row label="Item price" value={money(result.itemPrice)} />
                <Row
                    label="Referral fee"
                    hint={`${result.rate.toFixed(1)}% effective on this price`}
                    value={`- ${money(result.referral)}`}
                />
                {result.closing > 0 && (
                    <Row label="Closing fee" value={`- ${money(result.closing)}`} />
                )}
                {result.perItem > 0 && (
                    <Row label="Per-item fee" value={`- ${money(result.perItem)}`} />
                )}
                {result.subscriptionPerUnit > 0 && (
                    <Row
                        label="Subscription share"
                        hint={`${money(PROFESSIONAL_MONTHLY)} spread over ${result.units} units`}
                        value={`- ${money(result.subscriptionPerUnit)}`}
                    />
                )}
                <Row label="Total fees" value={`- ${money(result.fees)}`} />
                <Row
                    label="You keep"
                    value={money(result.payout)}
                    hint={`${result.margin.toFixed(1)}% of the item price`}
                    strong
                />

                <p className="text-sm mt-4">
                    At {result.units} units a month that is{" "}
                    <span className="font-bold">{money(result.monthlyPayout)}</span> before product
                    costs.
                </p>

                {loss && (
                    <p className="text-sm text-red-600 mt-3">
                        Fees are larger than the item price at this figure — raise the price or pick
                        the plan with no monthly charge.
                    </p>
                )}

                <p className="text-xs text-slate-500 mt-4">
                    Estimates only. Fulfilment, storage and advertising are not included.
                </p>
            </div>
        </div>
    );
};

export default FeeCalculator;
