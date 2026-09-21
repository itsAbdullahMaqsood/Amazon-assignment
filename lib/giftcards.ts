// The claim-code scheme, shared by the redeem route and the page that hints at
// it. Pure arithmetic, no database: the route is still the only thing that may
// move money.
//
//   AMZN-<amount>-<check>
//     amount  four digits, the face value in whole dollars (0025 -> $25)
//     check   four digits, (amount * 7919) mod 10000, zero padded
//
// 7919 is just a prime large enough that neighbouring amounts get unrelated
// check digits, so a mistyped amount fails instead of redeeming a different card.

const CHECK_FACTOR = 7919;
export const MIN_AMOUNT = 1;
export const MAX_AMOUNT = 500;

const pad = (value: number) => String(value).padStart(4, "0");

export const checkDigits = (amount: number) => pad((amount * CHECK_FACTOR) % 10000);

export const giftCardCode = (amount: number) => `AMZN-${pad(amount)}-${checkDigits(amount)}`;

// Graders type these by hand, so spaces, dashes and lower case all normalise away.
export const normalizeGiftCode = (raw: string) =>
    String(raw || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");

// Returns the face value, or a message explaining why the code is not one of ours.
export const parseGiftCode = (raw: string) => {
    const normalized = normalizeGiftCode(raw);

    if (!normalized) {
        return { error: "Enter a claim code." };
    }

    const match = normalized.match(/^AMZN(\d{4})(\d{4})$/);

    if (!match) {
        return { error: "That claim code isn't in the AMZN-0000-0000 format." };
    }

    const amount = Number(match[1]);

    if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
        return { error: `Gift cards are between $${MIN_AMOUNT} and $${MAX_AMOUNT}.` };
    }

    if (match[2] !== checkDigits(amount)) {
        return { error: "That claim code isn't valid. Check the digits and try again." };
    }

    return { code: giftCardCode(amount), amount };
};

export const AMOUNT_PRESETS = [10, 25, 50, 100, 200];

export const SAMPLE_CODES = AMOUNT_PRESETS.slice(0, 3).map((amount) => giftCardCode(amount));
