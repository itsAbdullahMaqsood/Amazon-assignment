import { addDays, addMonths, createLocalStore, today } from "@/lib/localStore";

// One key backs both /prime and /profile/memberships, so joining on the landing
// page is already reflected in the account area.
export const MEMBERSHIP_KEY = "markaz:prime-membership";
export const SUBSCRIPTIONS_KEY = "markaz:subscriptions";
export const SUBSCRIBE_SAVE_KEY = "markaz:subscribe-save";

export type Membership = {
    member: boolean;
    plan: string;
    startedAt: string;
    renewsOn: string;
    trial: boolean;
};

const NO_MEMBERSHIP: Membership = {
    member: false,
    plan: "",
    startedAt: "",
    renewsOn: "",
    trial: false,
};

export const membershipStore = createLocalStore<Membership>(MEMBERSHIP_KEY, NO_MEMBERSHIP);
export const subscriptionStore = createLocalStore<any>(SUBSCRIPTIONS_KEY, {});
export const subscribeSaveStore = createLocalStore<any>(SUBSCRIBE_SAVE_KEY, {});

export const plans = [
    {
        id: "monthly",
        name: "Monthly",
        price: 14.99,
        cadence: "month",
        renewsInMonths: 1,
        summary: "Cancel any time, billed every month.",
        eligibility: "Anyone",
    },
    {
        id: "annual",
        name: "Annual",
        price: 139,
        cadence: "year",
        renewsInMonths: 12,
        summary: "Works out to $11.58 a month — two months cheaper than monthly.",
        eligibility: "Anyone",
    },
    {
        id: "student",
        name: "Plus Student",
        price: 7.49,
        cadence: "month",
        renewsInMonths: 1,
        summary: "Half the monthly price for up to four years of study.",
        eligibility: "Students with a valid .edu address",
    },
];

export const planById = (id: string) => plans.find((plan) => plan.id === id) || plans[0];

// Joining always starts the 30-day trial, so the stored renewal date is when the
// first charge would land rather than one full billing period out.
export const join = (planId: string) => {
    const start = today();

    membershipStore.set({
        member: true,
        plan: planId,
        startedAt: start,
        renewsOn: addDays(start, 30),
        trial: true,
    });
};

export const cancel = () => {
    membershipStore.set(NO_MEMBERSHIP);
};

// What the member sees after the trial converts, for the "then $x on <date>" line.
export const nextBillingDate = (membership: Membership) =>
    membership.renewsOn ? addMonths(membership.renewsOn, planById(membership.plan).renewsInMonths) : "";

export const benefits = [
    {
        icon: "TruckIcon",
        title: "Fast, free delivery",
        copy: "Delivery here is priced per item: anything listed without a fee already ships free, for members and everyone else.",
    },
    {
        icon: "PlayCircleIcon",
        title: "Markaz Movies",
        copy: "Thousands of movies and shows included, plus rentals and purchases you keep.",
        href: "/movies",
    },
    {
        icon: "TagIcon",
        title: "Exclusive deals",
        copy: "Member-only coupons and early access to lightning deals across the catalogue.",
        href: "/coupons",
    },
    {
        icon: "BookOpenIcon",
        title: "Plus Reading",
        copy: "A rotating library of books, magazines and comics to read on any device.",
    },
    {
        icon: "PhotoIcon",
        title: "Markaz Photos",
        copy: "Unlimited full-resolution photo storage, shared with five family members.",
    },
    {
        icon: "PuzzlePieceIcon",
        title: "Plus Gaming",
        copy: "A free game selection every month and in-game loot for titles you already play.",
    },
];

// Real delivery pricing in this build: each product carries its own `shipping`
// value and the cart adds those up (components/CartPage/CartPage.tsx), so items
// with a zero fee already ship free for everybody.
export const deliveryTruth =
    "In this build every product carries its own delivery fee and the cart adds those fees up; " +
    "items listed with no fee already ship free for everyone. Plus membership here is a simulation " +
    "stored in your browser, so joining does not change what checkout charges you.";

export const faqs = [
    {
        title: "How much does Plus cost?",
        content:
            "$14.99 a month, $139 a year, or $7.49 a month on Plus Student. Every plan starts with a 30-day free trial and can be cancelled before the trial ends at no charge.",
    },
    {
        title: "What happens when the free trial ends?",
        content:
            "The plan you picked renews automatically on the date shown in your membership panel. Cancel before that date and you are not billed.",
    },
    {
        title: "Does Plus change my delivery charges in this store?",
        content: deliveryTruth,
    },
    {
        title: "Can I share my membership?",
        content:
            "Household lets you share delivery benefits and Markaz Movies with one other adult and up to four teen profiles. Household sharing is not implemented in this clone.",
    },
    {
        title: "How do I cancel?",
        content:
            "Use the Cancel membership button in the panel at the top of this page, or open Your Account, then Memberships & Subscriptions. Cancelling takes effect immediately here.",
    },
];

// The other recurring services Amazon lists under Memberships & Subscriptions.
// All four are simulated; none of them charge anything in this clone.
export const services = [
    {
        id: "kindle-unlimited",
        name: "Kindle Unlimited",
        price: 11.99,
        cadence: "month",
        renewsInMonths: 1,
        blurb: "Over four million titles to borrow, plus audiobook narration on select books.",
        trialCopy: "First 30 days free",
    },
    {
        id: "music-unlimited",
        name: "Markaz Music Unlimited",
        price: 10.99,
        cadence: "month",
        renewsInMonths: 1,
        blurb: "Ad-free music in HD, with offline downloads on every device you register.",
        trialCopy: "First 30 days free",
    },
    {
        id: "audible-premium-plus",
        name: "Audible Premium Plus",
        price: 14.95,
        cadence: "month",
        renewsInMonths: 1,
        blurb: "One audiobook credit a month, plus the Plus Catalog of included listens.",
        trialCopy: "First 30 days free, includes one credit",
    },
];

export const serviceById = (id: string) => services.find((service) => service.id === id);

export const subscribeService = (id: string) => {
    const service = serviceById(id);
    const start = today();

    subscriptionStore.set((current: any) => ({
        ...current,
        [id]: {
            active: true,
            startedAt: start,
            renewsOn: addMonths(start, service?.renewsInMonths || 1),
        },
    }));
};

export const cancelService = (id: string) => {
    subscriptionStore.set((current: any) => ({
        ...current,
        [id]: { active: false, startedAt: "", renewsOn: "" },
    }));
};

export const frequencies = [
    { value: "1", label: "Every month" },
    { value: "2", label: "Every 2 months" },
    { value: "3", label: "Every 3 months" },
    { value: "6", label: "Every 6 months" },
];

export const scheduleItem = (productId: string, months: string) => {
    subscribeSaveStore.set((current: any) => ({ ...current, [productId]: months }));
};

export const unscheduleItem = (productId: string) => {
    subscribeSaveStore.set((current: any) => {
        const next = { ...current };
        delete next[productId];

        return next;
    });
};
