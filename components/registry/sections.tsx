import Link from "next/link";

import { featuredRegistries, reasons, uniqueCards } from "@/lib/registry";
import { placeholder } from "@/components/profile/accountLinks";
import RegistryArt from "./art";
import OccasionStrip from "./OccasionStrip";

export const Hero = () => (
    <section className="max-w-[1500px] mx-auto px-6 pt-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,340px)_repeat(3,minmax(0,1fr))]">
            <div className="border border-slate-200 rounded-lg p-6 flex flex-col">
                <h1 className="text-3xl font-bold leading-tight">
                    Inspiration for life&apos;s biggest moments
                </h1>

                <p className="mt-4 text-[15px]">
                    For weddings, babies, birthdays, or any life event, registries and gift lists
                    ensure the perfect item.
                </p>

                <div className="mt-auto pt-6 space-y-3">
                    <Link
                        href="/registry/find"
                        className="block text-center border border-slate-400 rounded-full py-2 hover:bg-slate-50"
                    >
                        Find a registry
                    </Link>

                    <Link
                        href={placeholder("Create a registry or gift list")}
                        className="block text-center rounded-full py-2 bg-[#FFD814] hover:bg-[#F7CA00]"
                    >
                        Create
                    </Link>
                </div>
            </div>

            {featuredRegistries.map((registry) => (
                <Link
                    key={registry.key}
                    href={placeholder(registry.title)}
                    className="border border-slate-200 rounded-lg overflow-hidden group"
                >
                    <RegistryArt art={registry.key} className="h-[230px] w-full rounded-none" />

                    <div className="p-4">
                        <h2 className="text-xl font-bold group-hover:underline">{registry.title}</h2>
                        <p className="mt-1 text-[15px]">{registry.body}</p>
                    </div>
                </Link>
            ))}
        </div>
    </section>
);

export const Reasons = () => (
    <section className="max-w-[1500px] mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold">Reasons to register with Amazon</h2>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
            {reasons.map((reason) => (
                <div
                    key={reason.title}
                    className="border border-slate-200 rounded-lg p-8 text-center flex flex-col items-center"
                >
                    <RegistryArt art={reason.art} className="h-24 w-24 shrink-0 rounded-full" />

                    <h3 className="mt-5 text-lg font-bold">{reason.title}</h3>
                    <p className="mt-2 text-[15px] max-w-sm">{reason.body}</p>
                </div>
            ))}
        </div>
    </section>
);

export const CreateStrip = () => (
    <section className="max-w-[1500px] mx-auto px-6 pb-12">
        <h2 className="text-2xl font-bold mb-4">Create a registry or gift list</h2>

        <OccasionStrip />
    </section>
);

export const UniqueToYou = () => (
    <section className="max-w-[1500px] mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold mb-4">Make your registry unique to you</h2>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {uniqueCards.map((card) => (
                <div key={card.title}>
                    <RegistryArt art={card.art} className="h-[260px] w-full" />

                    <h3 className="mt-3 text-lg font-bold">{card.title}</h3>
                    <p className="mt-1 text-[15px]">{card.body}</p>
                </div>
            ))}
        </div>
    </section>
);
