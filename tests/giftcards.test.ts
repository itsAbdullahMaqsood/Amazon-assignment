import test from "node:test";
import assert from "node:assert/strict";

import { DEMO_CODES, MAX_AMOUNT, giftCardCode, parseGiftCode } from "@/lib/giftcards";

// A claim code carries its own value, so the parser is the whole card. It
// shipped broken for days — the store printed MRKZ- codes while the parser
// still matched ^AMZN — which is exactly the kind of thing these tests exist
// to catch.

test("every code the store prints is a code the store accepts", () => {
    for (const amount of [1, 10, 25, 50, 100, 200, MAX_AMOUNT]) {
        const parsed: any = parseGiftCode(giftCardCode(amount));

        assert.equal(parsed.error, undefined, `${giftCardCode(amount)} was rejected`);
        assert.equal(parsed.amount, amount);
    }
});

test("the demo codes printed on the gift card page work", () => {
    for (const { code, amount } of DEMO_CODES) {
        const parsed: any = parseGiftCode(code);

        assert.equal(parsed.error, undefined, `${code} was rejected`);
        assert.equal(parsed.amount, amount);
    }
});

test("the pre-rename prefix is not accepted", () => {
    const parsed: any = parseGiftCode("AMZN-0025-7975");

    assert.match(parsed.error, /MRKZ/);
});

test("spaces, dashes and lower case all normalise away", () => {
    const expected = parseGiftCode("MRKZ-0025-7975");

    for (const typed of ["mrkz 0025 7975", "MRKZ00257975", "  mrkz-0025-7975  ", "MrKz--0025--7975"]) {
        assert.deepEqual(parseGiftCode(typed), expected, `${typed} did not normalise`);
    }
});

test("a mistyped amount fails instead of redeeming a different card", () => {
    // $25's check digits against a $50 face value: the whole point of the scheme.
    const parsed: any = parseGiftCode("MRKZ-0050-7975");

    assert.match(parsed.error, /isn't valid/);
});

test("amounts outside the range are refused", () => {
    assert.match(parseGiftCode(giftCardCode(0)).error as string, /between/);
    assert.match(parseGiftCode(giftCardCode(MAX_AMOUNT + 1)).error as string, /between/);
});

test("an empty code asks for one", () => {
    assert.match(parseGiftCode("").error as string, /Enter a claim code/);
    assert.match(parseGiftCode(null as any).error as string, /Enter a claim code/);
});

test("nonsense is refused rather than guessed at", () => {
    for (const rubbish of ["hello", "MRKZ-25-79", "1234567890", "<script>"]) {
        assert.ok(parseGiftCode(rubbish).error, `${rubbish} was accepted`);
    }
});
