"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

import { formatDate } from "@/lib/localStore";
import { cancel, join, membershipStore, nextBillingDate, planById, plans } from "@/lib/prime";

// The membership state is simulated and lives in localStorage, so the panel reads
// it through useSyncExternalStore: the server snapshot is "not a member", which is
// what a signed-out visitor sees anyway, and the real value arrives after hydration.
const MembershipPanel = ({ signedIn, tone = "dark", className = "max-w-md" }: any) => {
    const membership: any = useSyncExternalStore(
        membershipStore.subscribe,
        membershipStore.getSnapshot,
        membershipStore.getServerSnapshot
    );

    const [choice, setChoice] = useState<string>("monthly");

    const dark = tone === "dark";
    const box = dark
        ? "bg-white/10 border border-white/20 text-white"
        : "bg-white border border-slate-300 text-black";
    const muted = dark ? "text-white/70" : "text-slate-600";
    const field = dark
        ? "bg-ink-900 border border-white/30 text-white"
        : "bg-white border border-slate-400 text-black";

    if (!signedIn) {
        return (
            <div className={`rounded-lg p-6 ${className} ${box}`}>
                <p className="text-lg font-bold">Try Plus free for 30 days</p>
                <p className={`mt-2 text-sm ${muted}`}>
                    Sign in to start a membership. After the trial your plan renews automatically
                    until you cancel.
                </p>
                <Link
                    href="/auth/signin?callbackUrl=/plus"
                    className="inline-block mt-5 px-8 py-2.5 rounded-full font-semibold bg-accent text-ink-900"
                >
                    Sign in to join Plus
                </Link>
            </div>
        );
    }

    if (!membership.member) {
        return (
            <div className={`rounded-lg p-6 ${className} ${box}`}>
                <p className="text-lg font-bold">You are not a Plus member</p>
                <p className={`mt-2 text-sm ${muted}`}>
                    Pick a plan and your 30-day free trial starts today.
                </p>

                <label htmlFor="prime-plan" className="sr-only">
                    Plus plan
                </label>
                <select
                    id="prime-plan"
                    value={choice}
                    onChange={(event) => setChoice(event.target.value)}
                    className={`mt-5 w-full rounded p-2.5 text-sm cursor-pointer ${field}`}
                >
                    {plans.map((plan) => (
                        <option key={plan.id} value={plan.id} className="text-black">
                            {plan.name} — ${plan.price.toFixed(2)} per {plan.cadence}
                        </option>
                    ))}
                </select>

                <button
                    type="button"
                    onClick={() => join(choice)}
                    className="w-full mt-4 px-8 py-2.5 rounded-full font-semibold bg-accent text-ink-900 cursor-pointer"
                >
                    Try Plus free for 30 days
                </button>
            </div>
        );
    }

    const plan = planById(membership.plan);

    return (
        <div className={`rounded-lg p-6 ${className} ${box}`}>
            <p className="flex items-center gap-2 text-lg font-bold">
                <CheckBadgeIcon className="w-6 h-6 text-accent" />
                Manage your membership
            </p>

            <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                    <dt className={muted}>Plan</dt>
                    <dd className="font-semibold">
                        {plan.name} — ${plan.price.toFixed(2)}/{plan.cadence}
                    </dd>
                </div>
                <div className="flex justify-between gap-4">
                    <dt className={muted}>Member since</dt>
                    <dd className="font-semibold">{formatDate(membership.startedAt)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                    <dt className={muted}>{membership.trial ? "Trial ends" : "Renews on"}</dt>
                    <dd className="font-semibold">{formatDate(membership.renewsOn)}</dd>
                </div>
                {membership.trial && (
                    <div className="flex justify-between gap-4">
                        <dt className={muted}>First charge</dt>
                        <dd className="font-semibold">
                            ${plan.price.toFixed(2)} on {formatDate(membership.renewsOn)}, then
                            every {plan.cadence} from{" "}
                            {formatDate(nextBillingDate(membership))}
                        </dd>
                    </div>
                )}
            </dl>

            <div className="flex flex-wrap gap-3 mt-5">
                <Link
                    href="/profile/memberships"
                    className="px-6 py-2 rounded-full font-semibold bg-accent text-ink-900"
                >
                    Membership settings
                </Link>
                <button
                    type="button"
                    onClick={cancel}
                    className={`px-6 py-2 rounded-full font-semibold cursor-pointer ${
                        dark ? "border border-white/40" : "border border-slate-400"
                    }`}
                >
                    Cancel membership
                </button>
            </div>

            <p className={`mt-4 text-xs ${muted}`}>
                This membership is simulated for the clone and is stored in this browser only.
            </p>
        </div>
    );
};

export default MembershipPanel;
