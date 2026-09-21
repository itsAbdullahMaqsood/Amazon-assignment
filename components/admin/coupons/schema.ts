import * as z from "zod";

// Shared by the coupon form and /api/admin/coupon, so both sides reject the
// same input with the same words.

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

// "2026-02-31" matches the pattern but is not a day; round-tripping through Date catches it.
const realDay = (value: string) => {
    const date = new Date(`${value}T00:00:00Z`);

    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const day = (missing: string) =>
    z
        .string()
        .min(1, missing)
        .regex(isoDate, "Use the format YYYY-MM-DD.")
        .refine(realDay, "That date does not exist.");

export const couponSchema = z
    .object({
        coupon: z
            .string()
            .trim()
            .min(4, "Coupon codes must be between 4 and 10 characters.")
            .max(10, "Coupon codes must be between 4 and 10 characters.")
            .regex(/^[A-Za-z0-9]+$/, "Use letters and numbers only, with no spaces.")
            .transform((value) => value.toUpperCase()),
        discount: z.coerce
            .number({ error: "Enter a discount between 1 and 99." })
            .int("The discount must be a whole percent.")
            .min(1, "Enter a discount between 1 and 99.")
            .max(99, "Enter a discount between 1 and 99."),
        startDate: day("Choose a start date."),
        endDate: day("Choose an end date."),
    })
    // Dates are "YYYY-MM-DD", so string order is date order (the checkout relies on the same).
    .refine((values) => values.endDate > values.startDate, {
        message: "The end date must be after the start date.",
        path: ["endDate"],
    });

export const couponStatus = (coupon: any, today: string) => {
    if (today < coupon.startDate) return "Scheduled";
    if (today > coupon.endDate) return "Expired";
    return "Active";
};
