"use client";

import { useSyncExternalStore } from "react";

import { formatDate } from "@/lib/localStore";
import { cancelService, subscribeService, subscriptionStore } from "@/lib/prime";

// One Kindle Unlimited / Music Unlimited / Audible row. Its state is simulated and
// kept per browser, so nothing here bills or writes to the database.
const ServiceCard = ({ service, compact = false }: any) => {
    const subscriptions: any = useSyncExternalStore(
        subscriptionStore.subscribe,
        subscriptionStore.getSnapshot,
        subscriptionStore.getServerSnapshot
    );

    const state = subscriptions?.[service.id] || {};
    const active = Boolean(state.active);

    if (compact) {
        return (
            <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-slate-200 last:border-b-0">
                <div>
                    <p className="font-semibold">{service.name}</p>
                    <p className="text-sm text-slate-600">
                        {active
                            ? `Renews ${formatDate(state.renewsOn)} · $${service.price.toFixed(2)}/${service.cadence}`
                            : "Not subscribed"}
                    </p>
                </div>

                <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                        active ? "bg-[#e3f2e1] text-[#1b6b2a]" : "bg-slate-100 text-slate-600"
                    }`}
                >
                    {active ? "Active" : "Inactive"}
                </span>
            </div>
        );
    }

    return (
        <article className="border border-slate-300 rounded-lg bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="text-lg font-bold">{service.name}</h3>
                    <p className="mt-1 text-sm text-slate-600 max-w-xl">{service.blurb}</p>
                </div>

                <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                        active ? "bg-[#e3f2e1] text-[#1b6b2a]" : "bg-slate-100 text-slate-600"
                    }`}
                >
                    {active ? "Active" : "Not subscribed"}
                </span>
            </div>

            <dl className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
                <div>
                    <dt className="text-slate-600">Price</dt>
                    <dd className="font-semibold">
                        ${service.price.toFixed(2)} per {service.cadence}
                    </dd>
                </div>
                <div>
                    <dt className="text-slate-600">{active ? "Renews on" : "Trial"}</dt>
                    <dd className="font-semibold">
                        {active ? formatDate(state.renewsOn) : service.trialCopy}
                    </dd>
                </div>
                <div>
                    <dt className="text-slate-600">Started</dt>
                    <dd className="font-semibold">
                        {active ? formatDate(state.startedAt) : "—"}
                    </dd>
                </div>
            </dl>

            <div className="flex flex-wrap gap-3 mt-5">
                {active ? (
                    <>
                        <button
                            type="button"
                            onClick={() => subscribeService(service.id)}
                            className="px-5 py-2 rounded-full font-semibold border border-slate-400 cursor-pointer"
                        >
                            Restart billing period
                        </button>
                        <button
                            type="button"
                            onClick={() => cancelService(service.id)}
                            className="px-5 py-2 rounded-full font-semibold border border-slate-400 cursor-pointer"
                        >
                            Cancel subscription
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={() => subscribeService(service.id)}
                        className="px-5 py-2 rounded-full font-semibold bg-linear-to-r from-amazon-orange to-yellow-300 text-amazon-blue_dark cursor-pointer"
                    >
                        Start {service.trialCopy.toLowerCase()}
                    </button>
                )}
            </div>
        </article>
    );
};

export default ServiceCard;
