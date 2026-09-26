import test from "node:test";
import assert from "node:assert/strict";

import { lineReturnInfo, returnWindowDays } from "@/lib/returns";

const daysAgo = (days: number) => new Date(Date.now() - days * 86400000);

const delivered = (days: number, extra: any = {}) => ({
    status: "Completed",
    createdAt: daysAgo(days + 5),
    paidAt: daysAgo(days + 4),
    deliveredAt: daysAgo(days),
    products: [{ qty: 1 }],
    returnRequests: [],
    ...extra,
});

test("the window is the one the product page promised", () => {
    assert.equal(returnWindowDays("7 days return policy"), 7);
    assert.equal(returnWindowDays("60 days return policy"), 60);
    assert.equal(returnWindowDays("90 days return policy"), 90);
});

test("no return policy means no returns", () => {
    assert.equal(returnWindowDays("No return policy"), 0);
    assert.equal(returnWindowDays("no returns"), 0);
});

test("wording the store does not recognise keeps the default", () => {
    assert.equal(returnWindowDays("Ask the seller"), 30);
    assert.equal(returnWindowDays(""), 30);
    assert.equal(returnWindowDays(null), 30);
});

test("the clock starts when it is delivered, not when it is ordered", () => {
    // Ordered 40 days ago but only delivered 2 days ago: still returnable.
    const order = { ...delivered(2), createdAt: daysAgo(40), paidAt: daysAgo(39) };

    assert.equal(lineReturnInfo(order, 0, "30 days return policy").returnable, true);
});

test("an undelivered order cannot be returned yet", () => {
    const order = { ...delivered(2), status: "Dispatched", deliveredAt: null };
    const info = lineReturnInfo(order, 0, "30 days return policy");

    assert.equal(info.returnable, false);
    assert.match(info.reason, /once it's delivered/);
});

test("a cancelled order says so rather than offering a return", () => {
    const info = lineReturnInfo({ ...delivered(2), status: "Cancelled" }, 0, "30 days return policy");

    assert.equal(info.returnable, false);
    assert.equal(info.reason, "Order cancelled");
});

test("past the product's own window, it is closed", () => {
    const info = lineReturnInfo(delivered(10), 0, "7 days return policy");

    assert.equal(info.returnable, false);
    assert.equal(info.reason, "Return window closed");
});

test("a longer policy keeps the same order open", () => {
    assert.equal(lineReturnInfo(delivered(10), 0, "60 days return policy").returnable, true);
});

test("an item with no policy can never go back", () => {
    const info = lineReturnInfo(delivered(1), 0, "No return policy");

    assert.equal(info.returnable, false);
    assert.equal(info.reason, "This item can't be returned");
});

test("the same line cannot be returned twice", () => {
    const order = delivered(1, {
        products: [{ qty: 2 }],
        returnRequests: [{ line: 0, qty: 2 }],
    });
    const info = lineReturnInfo(order, 0, "30 days return policy");

    assert.equal(info.remaining, 0);
    assert.equal(info.returnable, false);
    assert.equal(info.reason, "Return requested");
});

test("a partly returned line keeps the rest returnable", () => {
    const order = delivered(1, {
        products: [{ qty: 3 }],
        returnRequests: [{ line: 0, qty: 1 }],
    });
    const info = lineReturnInfo(order, 0, "30 days return policy");

    assert.equal(info.remaining, 2);
    assert.equal(info.returnable, true);
});
