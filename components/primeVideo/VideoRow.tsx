"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import { placeholder } from "@/components/profile/accountLinks";

const VideoRow = ({ title, videos, portrait = false }: any) => {
    const trackRef = useRef<HTMLDivElement | null>(null);

    if (!videos?.length) {
        return null;
    }

    const scrollBy = (direction: number) => {
        const track = trackRef.current;
        track?.scrollBy({ left: direction * (track.clientWidth * 0.8), behavior: "smooth" });
    };

    const arrow =
        "absolute top-0 bottom-0 z-20 w-12 flex items-center justify-center bg-linear-to-r from-transparent to-ink-950/90 opacity-0 group-hover:opacity-100 transition cursor-pointer";

    return (
        <section className="mt-10 group relative">
            <div className="flex items-center gap-4 px-6">
                <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
                <Link
                    href={placeholder(title)}
                    className="flex items-center text-sm md:text-base text-white/90 hover:underline"
                >
                    See more <ChevronRightIcon className="w-4 h-4 ml-1" />
                </Link>
            </div>

            <div className="relative mt-3">
                <button
                    onClick={() => scrollBy(-1)}
                    aria-label={`Scroll ${title} left`}
                    className={`${arrow} left-0 rotate-180`}
                >
                    <ChevronLeftIcon className="w-7 h-7 rotate-180" />
                </button>

                <div
                    ref={trackRef}
                    className="flex gap-3 overflow-x-auto scrollbar-hide px-6 scroll-smooth"
                >
                    {videos.map((video: any) => (
                        <article
                            key={video._id}
                            className={`relative shrink-0 rounded-md overflow-hidden bg-white/5 ${
                                portrait ? "w-[230px] h-[345px]" : "w-[320px] h-[180px]"
                            }`}
                        >
                            <Link href={placeholder(video.title)} className="block w-full h-full">
                                <Image
                                    src={`https://image.tmdb.org/t/p/${portrait ? "w500" : "w780"}${
                                        portrait ? video.posterPath : video.backdropPath || video.posterPath
                                    }`}
                                    alt={video.title}
                                    fill
                                    sizes={portrait ? "230px" : "320px"}
                                    className="object-cover"
                                />

                                {video.badge && (
                                    <span className="absolute top-0 right-0 bg-white text-black text-[11px] font-bold px-2 py-1">
                                        {video.badge}
                                    </span>
                                )}

                                {video.price > 0 && (
                                    <span className="absolute bottom-2 left-2 bg-black/70 text-[11px] font-semibold px-2 py-0.5 rounded">
                                        ${video.price.toFixed(2)}
                                    </span>
                                )}

                                <span className="absolute bottom-2 right-2 text-[11px] lowercase text-white/90">
                                    prime
                                </span>
                            </Link>
                        </article>
                    ))}
                </div>

                <button
                    onClick={() => scrollBy(1)}
                    aria-label={`Scroll ${title} right`}
                    className={`${arrow} right-0`}
                >
                    <ChevronRightIcon className="w-7 h-7" />
                </button>
            </div>
        </section>
    );
};

export default VideoRow;
