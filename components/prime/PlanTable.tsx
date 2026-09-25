"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { CheckIcon } from "@heroicons/react/24/outline";

import { join, membershipStore, plans } from "@/lib/prime";

// Every plan in this clone carries the same benefits, which is true of Amazon's
// plans too: the rows differ only in price, billing period and who may join.
const rows = [
    "Fast, free delivery",
    "Markaz Movies",
    "Exclusive deals",
    "Plus Reading",
    "Markaz Photos",
    "Plus Gaming",
];

const PlanTable = ({ signedIn }: any) => {
    const membership: any = useSyncExternalStore(
        membershipStore.subscribe,
        membershipStore.getSnapshot,
        membershipStore.getServerSnapshot
    );

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border border-slate-300 rounded-lg bg-white text-sm">
                <caption className="sr-only">Plus plan comparison</caption>
                <thead>
                    <tr className="border-b border-slate-300">
                        <th scope="col" className="text-left p-4 w-1/4">
                            Plan
                        </th>
                        {plans.map((plan) => (
                            <th key={plan.id} scope="col" className="p-4 text-left align-top">
                                <span className="block text-lg font-bold">{plan.name}</span>
                                <span className="block mt-1 text-xl font-bold text-accent-ink">
                                    ${plan.price.toFixed(2)}
                                    <span className="text-sm font-normal text-slate-600">
                                        {" "}
                                        per {plan.cadence}
                                    </span>
                                </span>
                                <span className="block mt-1 font-normal text-slate-600">
                                    {plan.summary}
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    <tr className="border-b border-slate-200">
                        <th scope="row" className="text-left p-4 font-semibold">
                            Free trial
                        </th>
                        {plans.map((plan) => (
                            <td key={plan.id} className="p-4">
                                30 days
                            </td>
                        ))}
                    </tr>

                    <tr className="border-b border-slate-200">
                        <th scope="row" className="text-left p-4 font-semibold">
                            Who can join
                        </th>
                        {plans.map((plan) => (
                            <td key={plan.id} className="p-4">
                                {plan.eligibility}
                            </td>
                        ))}
                    </tr>

                    {rows.map((row) => (
                        <tr key={row} className="border-b border-slate-200">
                            <th scope="row" className="text-left p-4 font-semibold">
                                {row}
                            </th>
                            {plans.map((plan) => (
                                <td key={plan.id} className="p-4">
                                    <CheckIcon className="w-5 h-5 text-green-700" aria-label="Included" />
                                </td>
                            ))}
                        </tr>
                    ))}

                    <tr>
                        <th scope="row" className="text-left p-4 font-semibold">
                            Start your trial
                        </th>
                        {plans.map((plan) => {
                            const current = membership.member && membership.plan === plan.id;

                            return (
                                <td key={plan.id} className="p-4">
                                    {current ? (
                                        <span className="inline-block px-5 py-2 rounded-full border border-slate-400 font-semibold">
                                            Your current plan
                                        </span>
                                    ) : signedIn ? (
                                        <button
                                            type="button"
                                            onClick={() => join(plan.id)}
                                            className="px-5 py-2 rounded-full font-semibold bg-accent text-ink-900 cursor-pointer"
                                        >
                                            {membership.member
                                                ? `Switch to ${plan.name}`
                                                : "Try Plus free for 30 days"}
                                        </button>
                                    ) : (
                                        <Link
                                            href="/auth/signin?callbackUrl=/plus"
                                            className="inline-block px-5 py-2 rounded-full font-semibold bg-accent text-ink-900"
                                        >
                                            Try Plus free for 30 days
                                        </Link>
                                    )}
                                </td>
                            );
                        })}
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default PlanTable;
