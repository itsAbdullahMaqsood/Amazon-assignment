"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckIcon, PlayIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";

import { daysUntil, formatDate } from "@/lib/localStore";

export const rentPrice = (video: any) => (video.price > 0 ? video.price : 3.99);
export const buyPrice = (video: any) => rentPrice(video) + 6;

const expiryCopy = (purchase: any) => {
    if (purchase.type !== "rent") {
        return `Purchased ${formatDate(purchase.at)} · yours to keep`;
    }

    const left = daysUntil(purchase.expiresAt);

    return left >= 0
        ? `Rental expires in ${left} day${left === 1 ? "" : "s"} · ${formatDate(purchase.expiresAt)}`
        : `Rental expired on ${formatDate(purchase.expiresAt)}`;
};

// One poster tile. The hover strip carries whatever the current tab can do with
// the title: remove it, acquire it, or just play it once it has been acquired.
const PosterCard = ({ video, entry, mode, onRemove, onAdd, onAcquire, saved }: any) => {
    const year = (video.releaseDate || "").slice(0, 4);

    return (
        <article className="group relative">
            <div className="relative w-full aspect-2/3 rounded-md overflow-hidden bg-white/10">
                {video.posterPath && (
                    <Image
                        src={`https://image.tmdb.org/t/p/w500${video.posterPath}`}
                        alt={video.title}
                        fill
                        sizes="(max-width: 768px) 45vw, 200px"
                        className="object-cover"
                    />
                )}

                {mode === "saved" && (
                    <button
                        type="button"
                        onClick={() => onRemove(video._id)}
                        className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 py-2 text-xs font-semibold bg-black/80 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition cursor-pointer"
                    >
                        <XMarkIcon className="w-4 h-4" />
                        Remove from Watchlist
                    </button>
                )}

                {mode === "suggestion" && (
                    <button
                        type="button"
                        onClick={() => (saved ? onRemove(video._id) : onAdd(video._id))}
                        className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 py-2 text-xs font-semibold bg-black/80 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition cursor-pointer"
                    >
                        {saved ? (
                            <>
                                <CheckIcon className="w-4 h-4" />
                                On your Watchlist
                            </>
                        ) : (
                            <>
                                <PlusIcon className="w-4 h-4" />
                                Add to Watchlist
                            </>
                        )}
                    </button>
                )}

                {mode === "purchased" && (
                    <Link
                        href="/prime-video"
                        className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 py-2 text-xs font-semibold bg-black/80 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
                    >
                        <PlayIcon className="w-4 h-4" />
                        Watch now
                    </Link>
                )}
            </div>

            <p className="mt-2 text-sm font-medium line-clamp-2">{video.title}</p>
            <p className="text-xs text-white/60">
                {year}
                {year && " · "}
                {video.mediaType === "tv" ? "TV show" : "Movie"}
            </p>

            {mode === "purchased" && entry?.purchase && (
                <p className="mt-1 text-xs text-white/70">{expiryCopy(entry.purchase)}</p>
            )}

            {mode === "saved" && (
                <div className="flex flex-wrap gap-2 mt-2">
                    <button
                        type="button"
                        onClick={() => onAcquire(video._id, "rent")}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 hover:bg-white/25 cursor-pointer"
                    >
                        Rent ${rentPrice(video).toFixed(2)}
                    </button>
                    <button
                        type="button"
                        onClick={() => onAcquire(video._id, "buy")}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 hover:bg-white/25 cursor-pointer"
                    >
                        Buy ${buyPrice(video).toFixed(2)}
                    </button>
                </div>
            )}
        </article>
    );
};

export default PosterCard;
