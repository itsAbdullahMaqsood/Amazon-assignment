import test from "node:test";
import assert from "node:assert/strict";

import { RENTAL_DAYS, badgeLabel, canRent, daysLeft, rentPrice, rentalLive } from "@/lib/movies";

const inDays = (days: number) => new Date(Date.now() + days * 86400000);

test("renting is 40% of the purchase price, rounded to .99", () => {
    assert.equal(rentPrice(6.99), 2.99);
    assert.equal(rentPrice(9.99), 3.99);
    assert.equal(rentPrice(8.99), 3.99);
});

test("renting never drops below the floor", () => {
    assert.equal(rentPrice(1.99), 1.99);
    assert.equal(rentPrice(2.99), 1.99);
});

test("a title is not offered for rent when renting costs what owning costs", () => {
    // The $1.99 floor meets the cheapest titles: those are sold outright, and
    // the sheet, the cards and the API all withhold the rent action.
    assert.equal(canRent(1.99), false);
    assert.equal(canRent(2.99), true);
    assert.equal(canRent(0), false, "a title with no price is not for sale at all");
});

test("a title with no price has no rent price", () => {
    assert.equal(rentPrice(0), 0);
});

test("a rental is live until its expiry passes", () => {
    assert.equal(rentalLive({ type: "rent", expiresAt: inDays(1) }), true);
    assert.equal(rentalLive({ type: "rent", expiresAt: inDays(-1) }), false);
    assert.equal(rentalLive({ type: "buy" }), false, "owning is not renting");
});

test("days left counts up to the expiry", () => {
    assert.equal(daysLeft(inDays(RENTAL_DAYS)), RENTAL_DAYS);
    assert.ok(daysLeft(inDays(-3)) < 0);
});

test("the seeder's shouty badges become words, and DEAL is dropped", () => {
    assert.equal(badgeLabel("NEW MOVIE"), "New release");
    assert.equal(badgeLabel("MOST LIKED"), "Highly rated");
    assert.equal(badgeLabel("DEAL"), "", "the price already says it");
    assert.equal(badgeLabel(""), "");
});
