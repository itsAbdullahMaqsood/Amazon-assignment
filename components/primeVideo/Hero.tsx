"use client";

import { useState } from "react";
import Image from "next/image";
import { InformationCircleIcon, PlusIcon, SpeakerWaveIcon } from "@heroicons/react/24/outline";

const Hero = ({ slides }: any) => {
    const [index, setIndex] = useState<number>(0);

    if (!slides.length) {
        return null;
    }

    const slide = slides[index];

    return (
        <section className="relative h-[520px] md:h-[620px] w-full overflow-hidden">
            {slide.backdropPath && (
                <Image
                    src={`https://image.tmdb.org/t/p/original${slide.backdropPath}`}
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                />
            )}

            <div className="absolute inset-0 bg-linear-to-r from-ink-950 via-ink-950/80 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-ink-950 to-transparent" />

            <div className="relative h-full max-w-[1500px] mx-auto px-6 flex flex-col justify-center">
                {slide.isOriginal && (
                    <p className="text-sm tracking-wide text-white/80 lowercase">prime original</p>
                )}

                <h1 className="mt-3 text-5xl md:text-7xl font-extrabold uppercase text-accent max-w-3xl leading-[0.95]">
                    {slide.title}
                </h1>

                <p className="flex items-center gap-2 mt-6 text-emerald-400 font-semibold">
                    <SpeakerWaveIcon className="w-6 h-6" />
                    {slide.mediaType === "tv" ? "All episodes available" : "Watch now"}
                </p>

                <div className="flex items-center gap-4 mt-6">
                    <button className="bg-white/25 hover:bg-white/35 transition px-6 py-3 rounded text-left cursor-pointer">
                        <span className="block text-xl font-bold">Watch with Plus</span>
                        <span className="block text-lg">Start your 30-day free trial</span>
                    </button>

                    <button
                        aria-label="Add to Watchlist"
                        className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer"
                    >
                        <PlusIcon className="w-7 h-7" />
                    </button>

                    <button
                        aria-label="More information"
                        className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer"
                    >
                        <InformationCircleIcon className="w-7 h-7" />
                    </button>
                </div>

                <p className="mt-4 text-sm text-white/80">Join Plus</p>

                <div className="absolute bottom-10 right-6 text-right">
                    <p className="text-sm text-white/80">Terms apply</p>
                    <span className="inline-block mt-2 bg-white/20 px-2 py-0.5 text-xs">
                        {slide.maturity}
                    </span>
                </div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    {slides.map((entry: any, i: number) => (
                        <button
                            key={entry._id}
                            onClick={() => setIndex(i)}
                            aria-label={`Show ${entry.title}`}
                            aria-current={i === index}
                            className={`h-2 rounded-full transition-all cursor-pointer ${
                                i === index ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Hero;
