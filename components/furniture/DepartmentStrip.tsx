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

// The strip Amazon Home runs above every one of its storefronts: the department
// you are on is boxed in blue, the rest are plain cards.
const DepartmentStrip = ({ title, tiles, active }: any) => {
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

    const page = (direction: number) => {
        const node = strip.current;

        if (node) {
            node.scrollBy({ left: direction * node.clientWidth, behavior: "smooth" });
        }
    };

    return (
        <section className="pt-4">
            <h2 className="text-2xl font-bold text-[#0f1111]">{title}</h2>

            <div className="relative mt-3">
                {edges.left && <Arrow side="left" onPage={page} className="top-1/2 -translate-y-1/2" />}
                {edges.right && <Arrow side="right" onPage={page} className="top-1/2 -translate-y-1/2" />}

                <ul
                    ref={strip}
                    onScroll={measure}
                    className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
                >
                    {tiles.map((tile: any) => {
                        const current = tile.label === active;

                        return (
                            <li key={tile.label} className="shrink-0 w-[152px]">
                                <Link
                                    href={tile.href}
                                    aria-current={current ? "page" : undefined}
                                    className={`block rounded-lg overflow-hidden border-2 p-1 ${
                                        current
                                            ? "border-[#007185]"
                                            : "border-transparent hover:border-[#d5d9d9]"
                                    }`}
                                >
                                    {tile.image ? (
                                        <div className="relative h-[112px] w-full rounded-lg overflow-hidden bg-[#f7f7f7]">
                                            <Image
                                                src={tile.image}
                                                alt=""
                                                fill
                                                sizes="160px"
                                                className="object-contain p-2"
                                            />
                                        </div>
                                    ) : (
                                        <FurnitureArt art={tile.art} className="h-[112px] w-full" />
                                    )}

                                    <p className="py-2 px-1 text-center text-sm text-[#0f1111] truncate">
                                        {tile.label}
                                    </p>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
};

export default DepartmentStrip;
