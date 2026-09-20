"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import { dealEnds, dealLabel, priceParts } from "@/lib/coupons";
import DealCountdown from "./DealCountdown";

const FeaturedDeals = ({ deals }: any) => {
    const trackRef = useRef<HTMLDivElement | null>(null);

    if (!deals?.length) {
        return null;
    }

    const scrollBy = (direction: number) => {
        const track = trackRef.current;
        track?.scrollBy({ left: direction * (track.clientWidth * 0.9), behavior: "smooth" });
    };

    const arrow =
        "absolute top-1/2 -translate-y-1/2 z-10 w-9 h-16 bg-white shadow-md rounded flex items-center justify-center hover:bg-slate-50 cursor-pointer";

    return (
        <section className="bg-[#1F6FEB] pb-8">
            <div className="max-w-[1500px] mx-auto px-4">
                <h2 className="text-2xl font-bold text-white py-4">Featured deals</h2>

                <div className="relative">
                    <button
                        onClick={() => scrollBy(-1)}
                        aria-label="Scroll featured deals left"
                        className={`${arrow} left-0`}
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>

                    <div
                        ref={trackRef}
                        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
                    >
                        {deals.map((deal: any) => {
                            const { whole, cents } = priceParts(deal.youPay);

                            return (
                                <article
                                    key={deal._id}
                                    className="bg-white rounded shrink-0 w-[230px] flex flex-col"
                                >
                                    <Link
                                        href={`/product/${deal.slug}?style=0`}
                                        className="block relative h-[230px]"
                                    >
                                        {deal.image && (
                                            <Image
                                                src={deal.image}
                                                alt={deal.name}
                                                fill
                                                sizes="230px"
                                                className="object-contain p-3"
                                            />
                                        )}
                                    </Link>

                                    <div className="px-3 pb-3 mt-auto">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-[#CC0C39] text-white text-xs font-bold rounded px-1.5 py-0.5">
                                                {deal.coupon}% off
                                            </span>
                                            {dealEnds(deal) ? (
                                                <DealCountdown />
                                            ) : (
                                                <span className="text-xs font-bold">
                                                    {dealLabel(deal)}
                                                </span>
                                            )}
                                        </div>

                                        <p className="flex items-start mt-2">
                                            <span className="text-xs mt-1">$</span>
                                            <span className="text-xl font-medium leading-none">
                                                {whole}
                                            </span>
                                            <span className="text-xs">{cents}</span>
                                            <span className="text-sm text-slate-500 line-through ml-2 self-end">
                                                ${Number(deal.listPrice).toFixed(2)}
                                            </span>
                                        </p>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => scrollBy(1)}
                        aria-label="Scroll featured deals right"
                        className={`${arrow} right-0`}
                    >
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default FeaturedDeals;
