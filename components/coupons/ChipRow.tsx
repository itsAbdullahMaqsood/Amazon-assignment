"use client";

import { useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

// The scrollable department rail above the grid. "Coupons" is the page itself so
// it always reads as selected; the rest toggle the department filter.
const ChipRow = ({ chips, active, onSelect, onClear }: any) => {
    const trackRef = useRef<HTMLDivElement | null>(null);

    const scrollBy = (direction: number) => {
        const track = trackRef.current;
        track?.scrollBy({ left: direction * (track.clientWidth * 0.8), behavior: "smooth" });
    };

    const arrow =
        "shrink-0 w-11 h-12 border border-slate-300 rounded-lg bg-white flex items-center justify-center hover:bg-slate-50 cursor-pointer";

    const chip = (active: boolean) =>
        `shrink-0 h-12 px-5 rounded-lg border text-sm whitespace-nowrap cursor-pointer ${
            active
                ? "border-[#0F5FA6] border-2 font-bold bg-white"
                : "border-slate-300 bg-white hover:bg-slate-50"
        }`;

    return (
        <div className="flex items-center gap-2">
            <button onClick={() => scrollBy(-1)} aria-label="Scroll departments left" className={arrow}>
                <ChevronLeftIcon className="w-5 h-5" />
            </button>

            <div
                ref={trackRef}
                className="flex items-center gap-3 overflow-x-auto scrollbar-hide scroll-smooth py-1"
            >
                {chips.map((entry: any) => (
                    <button
                        key={entry._id}
                        onClick={() => onSelect(entry)}
                        aria-pressed={active === entry._id}
                        className={chip(active === entry._id)}
                    >
                        {entry.name}
                    </button>
                ))}

                <button onClick={onClear} aria-current="page" className={chip(true)}>
                    Coupons
                </button>
            </div>

            <button onClick={() => scrollBy(1)} aria-label="Scroll departments right" className={arrow}>
                <ChevronRightIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default ChipRow;
