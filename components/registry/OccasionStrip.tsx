"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import { occasions } from "@/lib/registry";
import { placeholder } from "@/components/profile/accountLinks";
import RegistryArt from "./art";

// The row scrolls by one viewport at a time; the arrows hide at either end the
// way the carousel on Amazon's registry hub does.
const OccasionStrip = () => {
    const rail = useRef<HTMLDivElement>(null);
    const [atStart, setAtStart] = useState<boolean>(true);
    const [atEnd, setAtEnd] = useState<boolean>(false);

    const scrollHandler = () => {
        const node = rail.current;

        if (!node) {
            return;
        }

        setAtStart(node.scrollLeft < 8);
        setAtEnd(node.scrollLeft + node.clientWidth >= node.scrollWidth - 8);
    };

    const move = (direction: number) => {
        rail.current?.scrollBy({ left: direction * (rail.current.clientWidth * 0.8), behavior: "smooth" });
    };

    return (
        <div className="relative">
            <div
                ref={rail}
                onScroll={scrollHandler}
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
            >
                {occasions.map((occasion) => (
                    <Link
                        key={occasion.key}
                        href={placeholder(`Create a ${occasion.label} registry`)}
                        className="shrink-0 w-[220px] group"
                    >
                        <RegistryArt art={occasion.key} className="h-[220px] w-full" />
                        <p className="mt-2 text-center group-hover:underline">{occasion.label}</p>
                    </Link>
                ))}
            </div>

            {!atStart && (
                <button
                    onClick={() => move(-1)}
                    aria-label="Previous occasions"
                    className="absolute left-0 top-[110px] -translate-y-1/2 bg-white shadow-lg rounded-r-lg p-3 cursor-pointer"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
            )}

            {!atEnd && (
                <button
                    onClick={() => move(1)}
                    aria-label="More occasions"
                    className="absolute right-0 top-[110px] -translate-y-1/2 bg-white shadow-lg rounded-l-lg p-3 cursor-pointer"
                >
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            )}
        </div>
    );
};

export default OccasionStrip;
