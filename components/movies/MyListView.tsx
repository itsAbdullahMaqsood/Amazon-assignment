"use client";

import { useState } from "react";
import Link from "next/link";
import { BookmarkIcon } from "@heroicons/react/24/outline";

import Button from "@/components/ui/Button";
import { money } from "@/components/ui/Price";
import { cn } from "@/components/ui/cn";
import { RENTAL_DAYS, daysLeft } from "@/lib/movies";
import MoviesBar from "./MoviesBar";
import PosterTile from "./PosterTile";
import TitleSheet from "./TitleSheet";
import useMovieLibrary from "./useMovieLibrary";

const dateOf = (value: any) => new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

// A rental is kept even after the title has been bought: it is a record of
// something that happened. It says so, rather than sitting beside the purchase
// looking like a second copy.
const libraryNote = (entry: any, superseded: boolean) => {
    if (entry.type === "buy") {
        return `Bought ${dateOf(entry.at)} · ${money(entry.price)}`;
    }

    if (superseded) {
        return `Rented ${dateOf(entry.at)} for ${money(entry.price)} · you own it now`;
    }

    const left = daysLeft(entry.expiresAt);

    return left >= 0
        ? `Rental ends in ${left} day${left === 1 ? "" : "s"} · ${money(entry.price)}`
        : `Rental ended ${dateOf(entry.expiresAt)}`;
};

const Empty = ({ title, children, action }: any) => (
    <div className="mt-10 max-w-lg">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-fg-inverse/10 text-accent">
            <BookmarkIcon className="h-6 w-6" />
        </span>
        <h2 className="mt-4 font-display text-xl font-semibold text-fg-inverse">{title}</h2>
        <p className="mt-1 text-sm text-fg-inverse-muted">{children}</p>
        {action}
    </div>
);

const grid = "mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";

const MyListView = ({ initial }: any) => {
    const library = useMovieLibrary(initial);
    const [tab, setTab] = useState("list");
    const [open, setOpen] = useState<any>(null);

    const tabs = [
        { id: "list", label: "My list", count: library.list.length },
        { id: "library", label: "Purchases & rentals", count: library.library.length },
    ];

    return (
        <div className="min-h-[70vh] bg-ink-950 text-fg-inverse">
            <MoviesBar />

            <div className="mx-auto max-w-page px-4 pb-16 pt-6 sm:px-6 lg:px-8">
                <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">My list</h1>
                <p className="mt-1 text-sm text-fg-inverse-muted">
                    Saved on your account, so it follows you between devices.
                </p>

                <div role="tablist" aria-label="My list sections" className="mt-5 flex gap-6 border-b border-fg-inverse/15">
                    {tabs.map((entry) => (
                        <button
                            key={entry.id}
                            type="button"
                            role="tab"
                            aria-selected={tab === entry.id}
                            onClick={() => setTab(entry.id)}
                            className={cn(
                                "-mb-px flex items-center gap-2 border-b-2 pb-3 text-sm font-medium cursor-pointer",
                                tab === entry.id ? "border-accent text-fg-inverse" : "border-transparent text-fg-inverse-muted hover:text-fg-inverse"
                            )}
                        >
                            {entry.label}
                            <span className="rounded-full bg-fg-inverse/10 px-1.5 text-xs tabular">{entry.count}</span>
                        </button>
                    ))}
                </div>

                {tab === "list" ? (
                    library.list.length === 0 ? (
                        <Empty
                            title="Nothing saved yet"
                            action={
                                <Button href="/movies" className="mt-5">
                                    Browse Markaz Movies
                                </Button>
                            }
                        >
                            Open a title and add it here. Saving is free; buying and renting are the two things that cost
                            something, and both are simulated.
                        </Empty>
                    ) : (
                        <div className={grid}>
                            {library.list.map((entry: any) => (
                                <PosterTile
                                    key={entry.video._id}
                                    title={entry.video}
                                    onOpen={setOpen}
                                    saved
                                    footer={
                                        <p className="mt-1 text-xs text-fg-inverse-muted">
                                            {entry.video.price > 0 ? (entry.video.canRent ? `From ${money(entry.video.rentPrice)} to rent` : `${money(entry.video.price)} to buy`) : "Not for sale yet"}
                                        </p>
                                    }
                                />
                            ))}
                        </div>
                    )
                ) : library.library.length === 0 ? (
                    <Empty title="Nothing bought or rented yet">
                        A rental plays for {RENTAL_DAYS} days; a purchase stays here for good. Both are recorded against your
                        account, and neither charges anything —{" "}
                        <Link href="/movies" className="underline underline-offset-2">
                            browse the catalogue
                        </Link>
                        .
                    </Empty>
                ) : (
                    <div className={grid}>
                        {library.library.map((entry: any, i: number) => (
                            <PosterTile
                                key={`${entry.video._id}-${i}`}
                                title={entry.video}
                                onOpen={setOpen}
                                owned={entry.type === "buy"}
                                footer={
                                    <p className="mt-1 text-xs text-fg-inverse-muted">
                                        {libraryNote(entry, library.entries.get(entry.video._id)?.type === "buy" && entry.type === "rent")}
                                    </p>
                                }
                            />
                        ))}
                    </div>
                )}
            </div>

            <TitleSheet
                title={open}
                open={!!open}
                onClose={() => setOpen(null)}
                signedIn
                saved={open ? library.savedIds.has(open._id) : false}
                entry={open ? library.entries.get(open._id) : null}
                busy={library.busy}
                onSave={library.save}
                onRemove={library.remove}
                onAcquire={library.acquire}
            />
        </div>
    );
};

export default MyListView;
