import { createLocalStore, today } from "@/lib/localStore";

// Amazon Household is account state that this build does not model in Mongo, so
// it lives per-browser like the membership and device screens.
export const HOUSEHOLD_KEY = "markaz:household";

export type HouseholdMember = {
    id: string;
    name: string;
    email?: string;
    age?: number;
    role: "adult" | "teen" | "child";
    joinedAt: string;
};

const fallback: { members: HouseholdMember[]; sharing: any } = {
    members: [],
    sharing: { delivery: true, video: true, photos: true, reading: false },
};

export const householdStore = createLocalStore(HOUSEHOLD_KEY, fallback);

export const benefits = [
    {
        id: "delivery",
        label: "Plus delivery",
        description: "Shared delivery speeds on everything the household orders.",
    },
    {
        id: "video",
        label: "Markaz Movies",
        description: "Each person keeps their own watchlist and viewing history.",
    },
    {
        id: "photos",
        label: "Markaz Photos",
        description: "Unlimited full-resolution photo storage for up to five more people.",
    },
    {
        id: "reading",
        label: "Plus Reading",
        description: "Borrowed titles are visible to whoever borrowed them.",
    },
];

export const seats = [
    {
        role: "adult" as const,
        title: "Adults",
        limit: 1,
        blurb: "One other adult can share benefits. Both adults agree to share payment methods.",
        cta: "Add an adult",
    },
    {
        role: "teen" as const,
        title: "Teens",
        limit: 4,
        blurb: "Teens shop with their own login; every order asks you to approve it first.",
        cta: "Add a teen",
    },
    {
        role: "child" as const,
        title: "Children",
        limit: 4,
        blurb: "Child profiles get content you choose, and cannot buy anything.",
        cta: "Add a child",
    },
];

export const addMember = (member: Omit<HouseholdMember, "id" | "joinedAt">) => {
    householdStore.set((current: any) => ({
        ...current,
        members: [
            ...(current.members || []),
            {
                ...member,
                id: `${member.role}-${Date.now()}`,
                joinedAt: today(),
            },
        ],
    }));
};

export const removeMember = (id: string) => {
    householdStore.set((current: any) => ({
        ...current,
        members: (current.members || []).filter((member: any) => member.id !== id),
    }));
};

export const setSharing = (benefit: string, on: boolean) => {
    householdStore.set((current: any) => ({
        ...current,
        sharing: { ...current.sharing, [benefit]: on },
    }));
};
