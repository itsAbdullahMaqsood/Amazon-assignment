import * as z from "zod";

// One address schema for the form and the route that saves it, so the server
// refuses exactly what the form would have refused.
const text = (label: string, min: number, max: number) =>
    z
        .string()
        .trim()
        .min(1, `Enter ${label}.`)
        .min(min, `${label.charAt(0).toUpperCase() + label.slice(1)} looks too short.`)
        .max(max, `${label.charAt(0).toUpperCase() + label.slice(1)} is too long.`);

export const addressSchema = z.object({
    firstName: text("a first name", 1, 40),
    lastName: text("a last name", 1, 40),
    phoneNumber: z
        .string()
        .trim()
        .min(1, "Enter a phone number so the courier can reach you.")
        .regex(/^[+\d][\d\s()-]{5,19}$/, "Use digits, spaces and an optional +."),
    address1: text("the street address", 3, 100),
    address2: z.string().trim().max(100, "Keep it under 100 characters.").optional().or(z.literal("")),
    city: text("a city", 2, 60),
    state: z.string().trim().max(60).optional().or(z.literal("")),
    zipCode: text("a postcode", 2, 20),
    country: text("a country", 2, 60),
});

export type AddressInput = z.infer<typeof addressSchema>;

export const emptyAddress = {
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
};

export const addressLines = (address: any) =>
    [
        address.address1,
        address.address2,
        [address.city, address.state, address.zipCode].filter(Boolean).join(", "),
        address.country,
    ].filter(Boolean);
