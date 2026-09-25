// Copy and shapers for the registry hub at /registry. Nothing here touches
// mongoose, so the client components can import it too.
import { privacyLabel } from "@/lib/lists";

// The occasions the "Create a registry or gift list" strip offers, and the
// vocabulary the search results are labelled with.
export const occasions = [
    { key: "baby", label: "Baby", blurb: "Get help preparing for your new arrival." },
    { key: "wedding", label: "Wedding", blurb: "Register for gifts to start your new chapter." },
    { key: "birthday", label: "Birthday", blurb: "Round up the gifts you actually want." },
    { key: "holiday", label: "Holiday", blurb: "Share your wishes before the season starts." },
    { key: "housewarming", label: "Housewarming", blurb: "Kit out a new place, room by room." },
    { key: "college", label: "College", blurb: "Everything for the move into a dorm." },
    { key: "graduation", label: "Graduation", blurb: "Mark the end of one chapter." },
    { key: "gift", label: "Gift List", blurb: "Share gift ideas for any occasion." },
];

export const occasionOf = (key: string) =>
    occasions.find((occasion) => occasion.key === key) || occasions[occasions.length - 1];

// A list carries no occasion field, so the name is read for one. This is the
// same guess Amazon makes when it badges a list as a registry.
const keywords: Record<string, string[]> = {
    baby: ["baby", "shower", "newborn", "nursery", "expecting"],
    wedding: ["wedding", "bridal", "engagement", "honeymoon", "marriage"],
    birthday: ["birthday", "bday", "turning"],
    holiday: ["holiday", "christmas", "eid", "hanukkah", "diwali", "thanksgiving"],
    housewarming: ["housewarming", "new home", "apartment", "moving", "kitchen"],
    college: ["college", "dorm", "university", "campus", "school"],
    graduation: ["graduation", "grad", "class of"],
};

export const occasionKeyOf = (name: string) => {
    const lower = String(name || "").toLowerCase();
    const hit = Object.keys(keywords).find((key) =>
        keywords[key].some((word) => lower.includes(word))
    );

    return hit || "gift";
};

// A registry is a list plus the person it belongs to, so the owner travels with
// every result and the card can say whose it is.
export const toRegistryResult = (user: any, list: any) => {
    const key = occasionKeyOf(list.name);

    return {
        _id: String(list._id),
        name: list.name,
        owner: user.name || "Markaz customer",
        privacy: list.privacy || "private",
        privacyLabel: privacyLabel(list.privacy || "private"),
        occasion: key,
        occasionLabel: occasionOf(key).label,
        count: (list.items || []).length,
        createdAt: list.createdAt ? new Date(list.createdAt).toISOString() : "",
    };
};

// One saved item, flattened onto the colour variant it was saved from.
export const toRegistryItem = (entry: any) => {
    const product = entry.product || {};
    const index = Number(entry.style) || 0;
    const variant = product.subProducts?.[index] || product.subProducts?.[0] || {};
    const listPrice = variant.sizes?.[0]?.price || 0;
    const discount = variant.discount || 0;

    return {
        _id: String(product._id),
        name: product.name,
        slug: product.slug,
        style: index,
        image: variant.images?.[0]?.url || "",
        rating: product.rating || 0,
        numberReviews: product.numberReviews || 0,
        listPrice,
        discount,
        price: discount > 0 ? Number((listPrice - (listPrice * discount) / 100).toFixed(2)) : listPrice,
    };
};

// A search term goes into a regular expression, so the metacharacters in it are
// stripped of their meaning first.
export const searchPattern = (term: string) =>
    new RegExp(String(term).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

export const registryDate = (value: string) =>
    value
        ? new Date(value).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
          })
        : "";

export const reasons = [
    {
        title: "Earth's biggest selection",
        body: "Add items from Markaz to create a gift registry for any occasion.",
        art: "globe",
    },
    {
        title: "Easy to share",
        body: "Share your gift registry with friends and family so they'll know exactly what gifts to get.",
        art: "gift",
    },
    {
        title: "Extended returns",
        body: "Not quite right? Registry gifts have an extended return period.",
        art: "returns",
    },
];

export const uniqueCards = [
    {
        title: "Building made easy",
        body: "Use our recommendations or add items from product pages.",
        art: "travel",
    },
    {
        title: "Keep track of everything",
        body: "We help keep track of who bought what item and when, so it's easy for you to send thank you notes and manage purchases.",
        art: "wrapped",
    },
    {
        title: "Personalize your registry",
        body: "Add notes and highlight your most wanted gifts to guests.",
        art: "photos",
    },
    {
        title: "Easy to shop",
        body: "Shopping an Markaz Registry is a familiar experience for family and friends.",
        art: "kitchen",
    },
];

// The three cards beside the hero: the registries Amazon leads with.
export const featuredRegistries = [
    { key: "baby", title: "Baby Registry", body: "Get help preparing for your new arrival." },
    { key: "wedding", title: "Wedding Registry", body: "Register for gifts to start your new chapter." },
    {
        key: "gift",
        title: "Gift List",
        body: "Share gift ideas or needs for birthdays, holidays, graduations, new homes and more.",
    },
];
