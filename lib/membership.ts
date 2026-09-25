// Markaz Plus: what it costs, what it actually does, and how to read a stored
// membership. Nothing here touches the database, so the landing page, the
// account panel and the checkout quote all share one answer.

export const TRIAL_DAYS = 30;

export const plans = [
    {
        id: "monthly",
        name: "Monthly",
        price: 14.99,
        cadence: "a month",
        months: 1,
        summary: "Cancel whenever you like.",
    },
    {
        id: "annual",
        name: "Annual",
        price: 139,
        cadence: "a year",
        months: 12,
        summary: "$11.58 a month — two months cheaper than paying monthly.",
    },
];

export const planById = (id: string) => plans.find((plan) => plan.id === id) || plans[0];

const addDays = (from: Date, days: number) => new Date(from.getTime() + days * 86400000);

const addMonths = (from: Date, months: number) => {
    const date = new Date(from);
    const day = date.getUTCDate();

    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() + months);
    date.setUTCDate(Math.min(day, new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate()));

    return date;
};

// A membership runs from the day it was started until it is cancelled. The
// trial is the first 30 days of it; after that it would renew on the plan's
// cadence, which is worked out here rather than stored, so the date cannot go
// stale while nobody is billing anything.
export const membershipState = (membership: any) => {
    if (!membership?.startedAt || membership.status === "cancelled") {
        return { active: false, inTrial: false, plan: null, startedAt: null, trialEndsAt: null, renewsAt: null };
    }

    const started = new Date(membership.startedAt);
    const plan = planById(membership.plan);
    const trialEnds = membership.trialEndsAt ? new Date(membership.trialEndsAt) : addDays(started, TRIAL_DAYS);
    const inTrial = Date.now() < trialEnds.getTime();

    let renewsAt = trialEnds;

    while (renewsAt.getTime() <= Date.now()) {
        renewsAt = addMonths(renewsAt, plan.months);
    }

    return {
        active: true,
        inTrial,
        plan,
        startedAt: started.toISOString(),
        trialEndsAt: trialEnds.toISOString(),
        renewsAt: renewsAt.toISOString(),
    };
};

export const isMember = (membership: any) => membershipState(membership).active;

export const firstRenewal = (startedAt: Date) => addDays(startedAt, TRIAL_DAYS);

// Only two claims, because only two are true in this store. Both are enforced
// on the server, not printed on a page.
export const benefits = [
    {
        title: "No delivery charges",
        body: "Markaz prices delivery per item. With Plus, every one of those charges is waived — the checkout total is recomputed on the server, so it is the price you pay, not a badge.",
    },
    {
        title: "The Plus price at the pharmacy",
        body: "Medications in the Markaz Pharmacy carry two prices, cash and Plus. Members see the Plus price.",
        href: "/pharmacy",
    },
];

export const notClaimed =
    "That is the whole list. There is no music service, no reading library, no photo storage and no games behind it, so this page does not sell you any.";
