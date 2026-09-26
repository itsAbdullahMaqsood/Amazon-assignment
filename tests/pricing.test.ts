import test from "node:test";
import assert from "node:assert/strict";

import { applyAdjustments, summarize } from "@/lib/pricing";

// The cart, the checkout quote and order creation all call these two functions.
// If they are wrong, the three totals disagree and the store charges something
// the shopper never agreed to.

test("delivery is charged once per line, not per unit", () => {
    const totals = summarize([{ price: 10, qty: 3, shipping: 4.99 }]);

    assert.equal(totals.items, 3);
    assert.equal(totals.subtotal, 30);
    assert.equal(totals.shipping, 4.99, "three of one thing still ships once");
    assert.equal(totals.total, 34.99);
});

test("every line's delivery charge counts", () => {
    const totals = summarize([
        { price: 10, qty: 1, shipping: 4.99 },
        { price: 20, qty: 2, shipping: 2.5 },
        { price: 5, qty: 1 },
    ]);

    assert.equal(totals.items, 4);
    assert.equal(totals.subtotal, 55);
    assert.equal(totals.shipping, 7.49);
});

test("a Plus membership waives delivery and says how much was waived", () => {
    const lines = [{ price: 10, qty: 1, shipping: 4.99 }];
    const full = summarize(lines);
    const member = summarize(lines, { freeDelivery: true });

    assert.equal(full.shipping, 4.99);
    assert.equal(full.deliveryWaived, 0);

    assert.equal(member.shipping, 0);
    assert.equal(member.deliveryWaived, 4.99, "the struck-through figure on the summary");
    assert.equal(member.total, 10);
});

test("a coupon discounts the goods and never the delivery", () => {
    const base = { subtotal: 100, shipping: 10 };
    const { discount, total } = applyAdjustments(base, { couponPercent: 10 });

    assert.equal(discount, 10, "10% of the goods, not of the goods plus delivery");
    assert.equal(total, 100);
});

test("the gift card covers what is left, and no more", () => {
    const base = { subtotal: 40, shipping: 5 };
    const { giftCard, total } = applyAdjustments(base, { giftCardBalance: 500 });

    assert.equal(giftCard, 45, "it cannot spend more than the order costs");
    assert.equal(total, 0, "and the total never goes negative");
});

test("coupon first, then the gift card, on what is left", () => {
    const base = { subtotal: 100, shipping: 10 };
    const { discount, giftCard, total } = applyAdjustments(base, { couponPercent: 25, giftCardBalance: 30 });

    assert.equal(discount, 25);
    assert.equal(giftCard, 30);
    assert.equal(total, 55, "100 − 25 + 10 − 30");
});

test("a negative gift card balance cannot add to the bill", () => {
    const { giftCard, total } = applyAdjustments({ subtotal: 20, shipping: 0 }, { giftCardBalance: -100 });

    assert.equal(giftCard, 0);
    assert.equal(total, 20);
});

test("an empty cart totals nothing", () => {
    const totals = summarize([]);

    assert.deepEqual(
        { items: totals.items, subtotal: totals.subtotal, shipping: totals.shipping, total: totals.total },
        { items: 0, subtotal: 0, shipping: 0, total: 0 }
    );
});
