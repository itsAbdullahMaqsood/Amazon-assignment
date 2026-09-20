"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import Image from "next/image";

import FurnitureArt from "./art";

// Declared outside the carousel so it is not recreated on every scroll tick.
const Arrow = ({ side, onPage, className }: any) => (
    <button
        type="button"
        aria-label={side === "left" ? "Previous page" : "Next page"}
        onClick={() => onPage(side === "left" ? -1 : 1)}
        className={`hidden md:flex absolute z-10 h-[72px] w-[36px] items-center justify-center rounded bg-white shadow-[0_2px_8px_rgba(0,0,0,0.25)] border border-[#d5d9d9] cursor-pointer ${
            side === "left" ? "left-0" : "right-0"
        } ${className}`}
    >
        {side === "left" ? (
            <ChevronLeftIcon className="h-6 w-6 stroke-2" />
        ) : (
            <ChevronRightIcon className="h-6 w-6 stroke-2" />
        )}
    </button>
);

// Amazon's storefront carousel: 216px square tiles on one scrolling row, the
// label centred underneath, and a round chevron overlapping whichever edge still
// has tiles behind it.
const TileCarousel = ({ title, tiles }: any) => {
    const strip = useRef<HTMLUListElement>(null);
    const [edges, setEdges] = useState({ left: false, right: false });

    const measure = () => {
        const node = strip.current;

        if (!node) {
            return;
        }

        setEdges({
            left: node.scrollLeft > 8,
            right: node.scrollLeft + node.clientWidth < node.scrollWidth - 8,
        });
    };

    useEffect(() => {
        measure();

        const node = strip.current;
        const observer = new ResizeObserver(measure);

        if (node) {
            observer.observe(node);
        }

        return () => observer.disconnect();
    }, []);

    // One press moves a viewport of tiles, the way the storefront pages itself.
    const page = (direction: number) => {
        const node = strip.current;

        if (node) {
            node.scrollBy({ left: direction * node.clientWidth, behavior: "smooth" });
        }
    };

    return (
        <section className="mt-8 relative">
            <h2 className="text-2xl font-bold text-[#0f1111]">{title}</h2>

            <div className="relative mt-3">
                {edges.left && <Arrow side="left" onPage={page} className="top-[88px]" />}
                {edges.right && <Arrow side="right" onPage={page} className="top-[88px]" />}

                <ul
                    ref={strip}
                    onScroll={measure}
                    className="flex gap-[18px] overflow-x-auto scrollbar-hide scroll-smooth"
                >
                    {tiles.map((tile: any) => (
                        <li key={tile.label} className="shrink-0 w-[216px]">
                            <Link href={tile.href} className="group block">
                                {tile.image ? (
                                    <div className="relative h-[216px] w-[216px] rounded-lg overflow-hidden bg-[#f7f7f7] group-hover:opacity-90 transition-opacity">
                                        <Image
                                            src={tile.image}
                                            alt=""
                                            fill
                                            sizes="216px"
                                            className="object-contain p-3"
                                        />
                                    </div>
                                ) : (
                                    <FurnitureArt
                                        art={tile.art}
                                        className="h-[216px] w-[216px] group-hover:opacity-90 transition-opacity"
                                    />
                                )}

                                <p className="mt-2 text-center text-base leading-[1.3] text-[#0f1111] group-hover:text-[#C7511F] group-hover:underline">
                                    {tile.label}
                                </p>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default TileCarousel;
