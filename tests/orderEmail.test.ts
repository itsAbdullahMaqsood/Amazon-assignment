import test from "node:test";
import assert from "node:assert/strict";

import orderConfirmationTemplate from "@/emails/orderConfirmationTemplate";

const order = (extra: any = {}) => ({
    _id: "6ab6896e9c492a6cb6808531",
    products: [
        { name: "Girl Summer Dress", qty: 2, size: "S", price: 16.19 },
        { name: "iPhone 13 Pro", qty: 1, size: "128GB", price: 1000.99 },
    ],
    shippingAddress: { firstName: "Abdullah", lastName: "Maqsood", address1: "House 12", city: "Lahore", country: "Pakistan" },
    paymentMethod: "paypal",
    total: 1033.37,
    shippingPrice: 0,
    giftCardApplied: 0,
    couponApplied: "",
    isPaid: true,
    ...extra,
});

const amounts = (html: string) => (html.match(/\$[\d,]+\.\d{2}/g) || []);

test("the receipt lists every line with its quantity and size", () => {
    const html = orderConfirmationTemplate("demo@markaz.shop", "https://markaz.test/order/1", order());

    assert.ok(html.includes("Girl Summer Dress"));
    assert.ok(html.includes("Qty 2"));
    assert.ok(html.includes("size 128GB"));
});

test("the figures add up to what was charged", () => {
    const html = orderConfirmationTemplate("demo@markaz.shop", "https://markaz.test/order/1", order());

    // 2 × 16.19 + 1000.99
    assert.ok(html.includes("$1,033.37"), amounts(html).join(" "));
});

test("a coupon shows what it took off, derived from the stored totals", () => {
    const html = orderConfirmationTemplate(
        "demo@markaz.shop",
        "https://markaz.test/order/1",
        order({ couponApplied: "WELCOME10", total: 930.03 })
    );

    assert.ok(html.includes("WELCOME10"));
    assert.ok(html.includes("−$103.34"), amounts(html).join(" "));
});

test("a gift card shows as money off rather than disappearing into the total", () => {
    const html = orderConfirmationTemplate(
        "demo@markaz.shop",
        "https://markaz.test/order/1",
        order({ giftCardApplied: 50, total: 983.37 })
    );

    assert.ok(html.includes("Gift card"));
    assert.ok(html.includes("−$50.00"));
});

test("cash on delivery says what is still to pay", () => {
    const html = orderConfirmationTemplate("demo@markaz.shop", "https://markaz.test/order/1", order({ isPaid: false, paymentMethod: "cash" }));

    assert.ok(html.includes("To pay on delivery"));
    assert.ok(html.includes("paid in cash when it arrives"));
});

test("a product name cannot inject markup into the email", () => {
    const html = orderConfirmationTemplate(
        "demo@markaz.shop",
        "https://markaz.test/order/1",
        order({ products: [{ name: "<script>alert(1)</script>", qty: 1, size: "", price: 1 }] })
    );

    assert.ok(!html.includes("<script>"), "the name was not escaped");
    assert.ok(html.includes("&lt;script&gt;"));
});

test("it declares its encoding, so an em dash is not mojibake", () => {
    const html = orderConfirmationTemplate("demo@markaz.shop", "https://markaz.test/order/1", order());

    assert.ok(html.includes('<meta charset="utf-8" />'));
});

test("it says plainly that nothing was really charged", () => {
    const html = orderConfirmationTemplate("demo@markaz.shop", "https://markaz.test/order/1", order());

    assert.match(html, /simulated|no money/i);
});
