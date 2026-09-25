import * as z from "zod";

import { escapeRegex } from "@/utils/regex";

// The password rules, shown live on the form and enforced by the routes that
// set a password. Existing passwords keep working; the rules apply when one is
// chosen.
export const passwordRules = [
    { id: "length", label: "At least 8 characters", test: (value: string) => value.length >= 8 },
    { id: "letter", label: "A letter", test: (value: string) => /[a-z]/i.test(value) },
    { id: "number", label: "A number", test: (value: string) => /\d/.test(value) },
];

export const passwordIssue = (value: string) => {
    if (String(value || "").length > 72) return "Use 72 characters or fewer.";

    const failed = passwordRules.find((rule) => !rule.test(String(value || "")));

    return failed ? `Your password needs: ${failed.label.toLowerCase()}.` : "";
};

export const passwordSchema = z.string().superRefine((value, ctx) => {
    const issue = passwordIssue(value);
    if (issue) ctx.addIssue({ code: "custom", message: issue });
});

export const emailSchema = z.string().trim().min(1, "Enter your email.").email("That doesn't look like an email address.");

// Emails are stored lower case; older accounts may not be, so lookups ignore case.
export const normaliseEmail = (email: any) => String(email || "").trim().toLowerCase();

export const emailQuery = (email: any) => ({ email: { $regex: `^${escapeRegex(normaliseEmail(email))}$`, $options: "i" } });
