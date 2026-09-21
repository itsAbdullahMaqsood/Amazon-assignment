"use client";

import { useState } from "react";
import Link from "next/link";

import MembershipPanel from "@/components/prime/MembershipPanel";
import ServiceCard from "@/components/memberships/ServiceCard";
import SubscribeSave from "@/components/memberships/SubscribeSave";
import { services } from "@/lib/prime";

const sections = [
    { id: "memberships", label: "Your memberships" },
    { id: "subscribe-save", label: "Subscribe & Save" },
    { id: "digital", label: "Digital subscriptions" },
];

const MembershipsClient = ({ items }: any) => {
    const [section, setSection] = useState<string>("memberships");

    return (
        <div className="grid md:grid-cols-[220px_1fr] gap-8">
            <nav aria-label="Membership sections">
                <ul className="border border-slate-300 rounded-lg bg-white overflow-hidden">
                    {sections.map((entry) => (
                        <li key={entry.id} className="border-b border-slate-200 last:border-b-0">
                            <button
                                type="button"
                                onClick={() => setSection(entry.id)}
                                aria-current={section === entry.id ? "page" : undefined}
                                className={`w-full text-left px-4 py-3 text-sm cursor-pointer ${
                                    section === entry.id
                                        ? "bg-[#f0f7fb] font-bold border-l-4 border-l-[#0f6fa8]"
                                        : "hover:bg-slate-50"
                                }`}
                            >
                                {entry.label}
                            </button>
                        </li>
                    ))}
                </ul>

                <p className="mt-4 text-xs text-slate-600">
                    Every membership on this page is simulated and stored in this browser.
                </p>
            </nav>

            <div>
                {section === "memberships" && (
                    <div className="space-y-6">
                        <section>
                            <h2 className="text-xl font-bold mb-3">Amazon Prime</h2>
                            <MembershipPanel signedIn tone="light" className="w-full" />
                        </section>

                        <section className="border border-slate-300 rounded-lg bg-white p-5">
                            <h2 className="text-xl font-bold">Your other subscriptions</h2>
                            <div className="mt-2">
                                {services.map((service) => (
                                    <ServiceCard key={service.id} service={service} compact />
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={() => setSection("digital")}
                                className="mt-4 px-5 py-2 rounded-full text-sm font-semibold border border-slate-400 cursor-pointer"
                            >
                                Manage digital subscriptions
                            </button>
                        </section>

                        <p className="text-sm text-slate-600">
                            Looking for what Prime includes?{" "}
                            <Link
                                href="/prime"
                                className="text-[#0F5FA6] hover:text-[#C7511F] hover:underline"
                            >
                                Prime benefits and plans
                            </Link>
                        </p>
                    </div>
                )}

                {section === "subscribe-save" && (
                    <section>
                        <h2 className="text-xl font-bold">Subscribe &amp; Save</h2>
                        <p className="mt-1 mb-4 text-sm text-slate-600">
                            Items you have ordered before, on a delivery schedule you choose.
                        </p>
                        <SubscribeSave items={items} />
                    </section>
                )}

                {section === "digital" && (
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold">Digital subscriptions</h2>
                        {services.map((service) => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </section>
                )}
            </div>
        </div>
    );
};

export default MembershipsClient;
