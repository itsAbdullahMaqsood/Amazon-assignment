"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";

import PosterCard from "@/components/watchlist/PosterCard";
import {
    acquireTitle,
    addTitle,
    purchasedTitles,
    removeTitle,
    savedTitles,
    watchlistStore,
} from "@/lib/watchlist";

const tabs = [
    { id: "watchlist", label: "Watchlist" },
    { id: "purchases", label: "Purchases & Rentals" },
];

// The store holds ids only, so the titles are matched against the catalogue the
// server sent. An id whose title has left the catalogue simply drops out.
const WatchlistClient = ({ videos, suggestions }: any) => {
    const entries: any = useSyncExternalStore(
        watchlistStore.subscribe,
        watchlistStore.getSnapshot,
        watchlistStore.getServerSnapshot
    );

    const [tab, setTab] = useState<string>("watchlist");

    const byId = new Map(videos.map((video: any) => [String(video._id), video]));

    const withVideo = (list: any[]) =>
        list
            .map((entry: any) => ({ entry, video: byId.get(String(entry.id)) }))
            .filter((row: any) => row.video);

    const saved = withVideo(savedTitles(entries));
    const purchased = withVideo(purchasedTitles(entries));
    const savedIds = new Set(saved.map((row: any) => String(row.entry.id)));

    const grid = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6";

    return (
        <div className="max-w-[1500px] mx-auto px-6 pb-16">
            <h1 className="text-3xl font-bold">Watchlist</h1>

            <div role="tablist" aria-label="Watchlist sections" className="flex gap-6 mt-4 border-b border-white/20">
                {tabs.map((entry) => (
                    <button
                        key={entry.id}
                        type="button"
                        role="tab"
                        aria-selected={tab === entry.id}
                        onClick={() => setTab(entry.id)}
                        className={`pb-3 text-sm md:text-base font-semibold cursor-pointer border-b-4 ${
                            tab === entry.id
                                ? "border-b-accent text-white"
                                : "border-b-transparent text-white/70 hover:text-white"
                        }`}
                    >
                        {entry.label}
                    </button>
                ))}
            </div>

            {tab === "watchlist" ? (
                saved.length === 0 ? (
                    <div className="mt-10 max-w-xl">
                        <p className="text-xl font-bold">Your Watchlist is empty</p>
                        <p className="mt-2 text-white/70">
                            Save a movie or show and it waits here until you are ready to watch it.
                        </p>
                        <Link
                            href="/movies"
                            className="inline-block mt-5 px-6 py-2 rounded-full font-semibold bg-accent text-ink-900"
                        >
                            Browse Markaz Movies
                        </Link>
                    </div>
                ) : (
                    <div className={grid}>
                        {saved.map((row: any) => (
                            <PosterCard
                                key={row.entry.id}
                                video={row.video}
                                entry={row.entry}
                                mode="saved"
                                onRemove={removeTitle}
                                onAcquire={acquireTitle}
                            />
                        ))}
                    </div>
                )
            ) : purchased.length === 0 ? (
                <div className="mt-10 max-w-xl">
                    <p className="text-xl font-bold">You have no purchases or rentals</p>
                    <p className="mt-2 text-white/70">
                        Titles you rent or buy appear here. A rental stays playable for 30 days; a
                        purchase never expires.
                    </p>
                    <button
                        type="button"
                        onClick={() => setTab("watchlist")}
                        className="mt-5 px-6 py-2 rounded-full font-semibold bg-accent text-ink-900 cursor-pointer"
                    >
                        Back to your Watchlist
                    </button>
                </div>
            ) : (
                <div className={grid}>
                    {purchased.map((row: any) => (
                        <PosterCard
                            key={row.entry.id}
                            video={row.video}
                            entry={row.entry}
                            mode="purchased"
                            onRemove={removeTitle}
                        />
                    ))}
                </div>
            )}

            {suggestions.length > 0 && (
                <section className="mt-14 border-t border-white/15 pt-8">
                    <h2 className="text-xl font-bold">Add to your Watchlist</h2>
                    <p className="mt-1 text-sm text-white/70">
                        Popular on Markaz Movies right now. Your Watchlist is stored in this browser.
                    </p>

                    <div className={grid}>
                        {suggestions.map((video: any) => (
                            <PosterCard
                                key={video._id}
                                video={video}
                                mode="suggestion"
                                saved={savedIds.has(String(video._id))}
                                onAdd={addTitle}
                                onRemove={removeTitle}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default WatchlistClient;
