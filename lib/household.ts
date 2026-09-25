// A Markaz household is the people you share your Plus delivery with. One
// benefit, because one is all this store has; the page says so.

export const MAX_MEMBERS = 4;

export const memberIssue = (name: string, email: string, existing: string[] = [], ownEmail = "") => {
    const trimmedName = String(name || "").trim();
    const trimmedEmail = String(email || "").trim().toLowerCase();

    if (trimmedName.length < 2) return "Enter the person's name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return "That doesn't look like an email address.";
    if (trimmedEmail === String(ownEmail || "").toLowerCase()) return "That is your own email address.";
    if (existing.some((entry) => entry.toLowerCase() === trimmedEmail)) return "They are already in your household.";

    return "";
};

export const householdDate = (value: any) =>
    value ? new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "";
