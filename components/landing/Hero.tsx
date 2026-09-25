"use client";

import Image from "next/image";
import Link from "next/link";

import { useAppDispatch } from "@/redux/hooks";
import { openAssistant } from "@/redux/slices/AssistantSlice";
import ShabanaMark from "@/components/shabana/ShabanaMark";

const examples = ["A gift for a runner under $50", "A laptop for university", "Skin care for dry skin"];

// No carousel. One sentence about the store, and the fastest way in for someone
// who doesn't know the product name yet: ask Shabana. The collage is four real
// department cards from the catalogue.
const Hero = ({ departments = [], productCount, firstName }: any) => {
    const dispatch = useAppDispatch();
    const tiles = departments.filter((department: any) => department.image).slice(0, 4);

    return (
        <section className="relative overflow-hidden rounded-panel bg-ink-900 text-fg-inverse">
            <div aria-hidden="true" className="absolute -right-32 -top-40 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />

            <div className="relative grid items-center gap-10 px-6 py-10 md:px-10 md:py-14 lg:grid-cols-[1.15fr_1fr]">
                <div>
                    <p className="text-sm font-medium text-accent">
                        {firstName ? `Welcome back, ${firstName}` : `${productCount} products across ${departments.length} departments`}
                    </p>
                    <h1 className="mt-3 max-w-xl font-display text-3xl font-semibold leading-[1.08] tracking-tight md:text-4xl">
                        A general store that gets to the point.
                    </h1>
                    <p className="mt-4 max-w-lg text-fg-inverse-muted">
                        Prices checked again at checkout, delivery and returns stated on every product, and no sponsored rows
                        between you and what you searched for.
                    </p>

                    <button
                        type="button"
                        onClick={() => dispatch(openAssistant())}
                        className="mt-7 flex w-full max-w-lg items-center gap-3 rounded-panel bg-surface p-2 pr-4 text-left text-fg shadow-pop transition hover:ring-2 hover:ring-accent cursor-pointer"
                    >
                        <ShabanaMark />
                        <span className="flex-1 text-fg-muted">Not sure what you need? Ask Shabana</span>
                        <span className="hidden text-sm font-medium text-accent-ink sm:inline">Start</span>
                    </button>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {examples.map((example) => (
                            <button
                                key={example}
                                type="button"
                                onClick={() => dispatch(openAssistant({ prompt: example }))}
                                className="rounded-full border border-fg-inverse/15 px-3 py-1.5 text-sm text-fg-inverse-muted transition hover:border-accent hover:text-fg-inverse cursor-pointer"
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="hidden grid-cols-2 gap-3 lg:grid">
                    {tiles.map((tile: any, i: number) => (
                        <Link
                            key={tile.slug}
                            href={tile.href}
                            className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-card bg-surface p-3"
                        >
                            <Image
                                src={tile.image}
                                alt=""
                                fill
                                sizes="240px"
                                priority={i < 2}
                                className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                            />
                            <span className="relative w-fit rounded-control bg-surface/90 px-2 py-1 text-sm font-medium text-fg">
                                {tile.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Hero;
