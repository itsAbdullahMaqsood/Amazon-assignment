"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const AislesRow = ({ aisles }: any) => {
    const trackRef = useRef<HTMLDivElement | null>(null);

    if (!aisles.length) {
        return null;
    }

    const scrollBy = (direction: number) => {
        const track = trackRef.current;
        track?.scrollBy({ left: direction * (track.clientWidth * 0.8), behavior: "smooth" });
    };

    const arrow =
        "w-10 h-12 shrink-0 border border-slate-300 rounded-lg bg-white flex items-center justify-center hover:bg-slate-50 cursor-pointer";

    return (
        <section className="mt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Shop Aisles</h2>
                <Link href="/browse" className="text-sm text-[#007185] hover:underline">
                    See more Aisles ›
                </Link>
            </div>

            <div className="flex items-center gap-3 mt-4">
                <button onClick={() => scrollBy(-1)} aria-label="Scroll aisles left" className={arrow}>
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>

                <div ref={trackRef} className="flex-1 flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth">
                    {aisles.map((aisle: any) => (
                        <Link
                            key={aisle._id}
                            href={`/browse?category=${aisle.categoryId}`}
                            className="shrink-0 w-[150px] text-center"
                        >
                            <div className="w-[150px] h-[190px] border border-slate-200 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                                {aisle.image && (
                                    <Image
                                        src={aisle.image}
                                        alt=""
                                        width={140}
                                        height={170}
                                        className="object-contain max-h-[170px]"
                                    />
                                )}
                            </div>
                            <p className="mt-2 text-sm">{aisle.name}</p>
                        </Link>
                    ))}
                </div>

                <button onClick={() => scrollBy(1)} aria-label="Scroll aisles right" className={arrow}>
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </div>
        </section>
    );
};

export default AislesRow;
