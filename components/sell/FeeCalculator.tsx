"use client";

import { useState } from "react";

import { Notice } from "@/components/ui/Layout";
import { Input, Select } from "@/components/ui/Field";
import { RadioCard } from "@/components/ui/Choice";
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
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2 last:border-b-0">
        <span className={strong ? "font-semibold text-fg" : "text-fg-muted"}>
            {label}
            {hint && <span className="block text-xs text-fg-subtle">{hint}</span>}
        </span>
        <span className={strong ? "font-display text-lg font-semibold tabular text-fg" : "font-medium tabular text-fg"}>{value}</span>
    </div>
);

const plans = [
    { value: "professional", label: "Professional", hint: `${money(PROFESSIONAL_MONTHLY)} a month, no per-item fee` },
    { value: "individual", label: "Individual", hint: `${money(INDIVIDUAL_PER_ITEM)} for every item sold, no subscription` },
];

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
            <div className="rounded-card border border-line bg-surface p-5">
                <div className="mb-4">
                    <label htmlFor="fee-category" className="mb-1.5 block text-sm font-medium text-fg">
                        Product category
                    </label>
                    <Select
                        id="fee-category"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className=""
                    >
                        {categories.map((entry) => (
                            <option key={entry.id} value={entry.id}>
                                {entry.label}
                            </option>
                        ))}
                    </Select>
                    <p className="mt-1.5 text-xs text-fg-muted">
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
                    <label htmlFor="fee-price" className="mb-1.5 block text-sm font-medium text-fg">
                        Item price
                    </label>
                    <Input
                        id="fee-price"
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={price}
                        onChange={(e: any) => setPrice(e.target.value)}
                    />
                </div>

                <fieldset className="mb-4">
                    <legend className="mb-1.5 text-sm font-medium text-fg">Selling plan</legend>
                    <div className="grid gap-2">
                        {plans.map((option: any) => (
                            <RadioCard
                                key={option.value}
                                name="plan"
                                value={option.value}
                                checked={plan === option.value}
                                onChange={(e: any) => setPlan(e.target.value)}
                                label={option.label}
                                description={option.hint}
                            />
                        ))}
                    </div>
                </fieldset>

                <div>
                    <label htmlFor="fee-units" className="mb-1.5 block text-sm font-medium text-fg">
                        Units you expect to sell each month
                    </label>
                    <Input
                        id="fee-units"
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        value={unitsPerMonth}
                        onChange={(e) => setUnitsPerMonth(e.target.value)}
                        className=""
                    />
                    <p className="mt-1.5 text-xs text-fg-muted">
                        Used to spread the Professional subscription across your sales. Above{" "}
                        {planBreakEvenUnits} units a month the Professional plan costs less than the
                        per-item fee.
                    </p>
                </div>
            </div>

            <div className="rounded-card border border-line bg-surface-muted p-5">
                <h3 className="font-display text-lg font-semibold text-fg">Estimated payout</h3>
                <p className="mb-3 text-sm text-fg-muted">
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
                    <span className="font-semibold tabular">{money(result.monthlyPayout)}</span> before product
                    costs.
                </p>

                {loss && (
                    <p className="mt-3 text-sm text-danger">
                        Fees are larger than the item price at this figure — raise the price or pick
                        the plan with no monthly charge.
                    </p>
                )}

                <p className="mt-4 text-xs text-fg-muted">
                    Estimates only. Fulfilment, storage and advertising are not included.
                </p>
            </div>
        </div>
    );
};

export default FeeCalculator;
