import test from "node:test";
import assert from "node:assert/strict";

import {
    INDIVIDUAL_PER_ITEM,
    MINIMUM_REFERRAL_FEE,
    PROFESSIONAL_MONTHLY,
    estimate,
    planBreakEvenUnits,
    referralFee,
} from "@/lib/sellerFees";

// The calculator on /sell is the one piece of real arithmetic on that page, so
// both shapes of tier are worth pinning down.

test("a flat category charges one rate on the whole price", () => {
    assert.equal(referralFee("home", 100), 15);
});

test("a threshold category picks one rate by the band the price falls in", () => {
    // Beauty: 8% up to $10, 15% above it — on the whole price either way.
    assert.equal(referralFee("beauty", 10), 0.8);
    assert.equal(referralFee("beauty", 20), 3);
});

test("the minimum fee applies to very cheap items", () => {
    assert.equal(referralFee("home", 0.5), MINIMUM_REFERRAL_FEE);
});

test("nothing is charged on nothing", () => {
    assert.equal(referralFee("home", 0), 0);
});

test("the individual plan costs per item and the professional plan per month", () => {
    const individual = estimate({ categoryId: "home", price: 100, plan: "individual", unitsPerMonth: 10 });
    const professional = estimate({ categoryId: "home", price: 100, plan: "professional", unitsPerMonth: 10 });

    assert.equal(individual.perItem, INDIVIDUAL_PER_ITEM);
    assert.equal(individual.subscriptionPerUnit, 0);

    assert.equal(professional.perItem, 0);
    assert.equal(professional.subscriptionPerUnit, PROFESSIONAL_MONTHLY / 10);
});

test("what you keep is the price less every fee", () => {
    const result = estimate({ categoryId: "home", price: 100, plan: "individual", unitsPerMonth: 1 });

    assert.equal(result.fees, result.referral + result.closing + result.perItem + result.subscriptionPerUnit);
    assert.equal(result.payout, 100 - result.fees);
});

test("the plans cross over where the subscription equals the per-item fee", () => {
    assert.equal(planBreakEvenUnits, Math.ceil(PROFESSIONAL_MONTHLY / INDIVIDUAL_PER_ITEM));

    const below = estimate({ categoryId: "home", price: 50, plan: "professional", unitsPerMonth: planBreakEvenUnits - 20 });
    const belowIndividual = estimate({ categoryId: "home", price: 50, plan: "individual", unitsPerMonth: planBreakEvenUnits - 20 });

    assert.ok(below.fees > belowIndividual.fees, "under the crossover, paying per item is cheaper");
});
