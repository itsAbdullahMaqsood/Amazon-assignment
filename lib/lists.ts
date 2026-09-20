// Static copy and shapers for the Lists & Registries hub. Nothing here touches
// mongoose, so the client components can import it too.

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
    createdAt: list.createdAt ? new Date(list.createdAt).toISOString() : "",
});

export const benefits = [
    {
        title: "Stay organized",
        body: "Save your items and ideas in one convenient location",
        art: "box",
    },
    {
        title: "Shop with friends",
        body: "View and edit items in lists together with friends",
        art: "friends",
    },
    {
        title: "Save money",
        body: "Check deals and price drops on your saved items",
        art: "deal",
    },
];

export const registries = [
    { title: "I'm getting married", art: "wedding", occasion: "Wedding Registry" },
    { title: "I'm welcoming a baby", art: "baby", occasion: "Baby Registry" },
    { title: "Celebrating a different occasion", art: "gift", occasion: "Custom Gift List" },
];
