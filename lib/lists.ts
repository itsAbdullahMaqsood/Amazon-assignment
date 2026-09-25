// The rules a list follows, shared by the pages, the sheet and the route that
// writes them. Nothing here touches mongoose, so a client component can import
// it too.

export const MAX_NAME = 50;

export const privacyOptions = [
    {
        value: "private",
        label: "Private",
        hint: "Only you can see this list",
    },
    {
        value: "shared",
        label: "Shared",
        hint: "Anyone with the link can see this list",
    },
    {
        value: "public",
        label: "Public",
        hint: "Anyone can search for and see this list",
    },
];

export const privacyLabel = (value: string) =>
    privacyOptions.find((option) => option.value === value)?.label || "Private";

// A name has to survive being shown on a card, and two lists with the same name
// are indistinguishable once created, so both rules live here and are enforced
// on the server as well as in the modal.
export const validateName = (name: string, existing: string[] = []) => {
    const trimmed = name.trim();

    if (!trimmed) {
        return "Enter a name for your list.";
    }

    if (trimmed.length > MAX_NAME) {
        return `Keep the name to ${MAX_NAME} characters or fewer.`;
    }

    if (existing.some((entry) => entry.toLowerCase() === trimmed.toLowerCase())) {
        return "You already have a list with that name.";
    }

    return "";
};

export const toList = (list: any) => ({
    _id: String(list._id),
    name: list.name,
    privacy: list.privacy || "private",
    count: (list.items || []).length,
    bought: (list.items || []).filter((item: any) => item.purchasedAt).length,
    createdAt: list.createdAt ? new Date(list.createdAt).toISOString() : "",
});

// A shared or public list has a link worth giving out; a private one does not.
export const isShareable = (privacy: string) => privacy === "shared" || privacy === "public";

export const listDate = (value: any) =>
    value ? new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "";
