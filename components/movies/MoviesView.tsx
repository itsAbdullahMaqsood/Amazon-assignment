"use client";

import { useState } from "react";
import Image from "next/image";
import { StarIcon } from "@heroicons/react/24/solid";

import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { money } from "@/components/ui/Price";
import { badgeLabel } from "@/lib/movies";
import MoviesBar from "./MoviesBar";
import TitleRow from "./TitleRow";
import TitleSheet from "./TitleSheet";
import useMovieLibrary from "./useMovieLibrary";

// One title, the most popular one the buttons can actually act on. No carousel:
// a still hero puts the film in front of you instead of moving it away.
const Hero = ({ title, onOpen }: any) => {
    if (!title) {
        return null;
    }

    return (
        <section className="relative">
            <div className="relative h-[360px] w-full sm:h-[460px] lg:h-[520px]">
                {title.backdropPath && (
                    <Image
                        src={`https://image.tmdb.org/t/p/original${title.backdropPath}`}
                        alt=""
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover"
                    />
                )}
                {/* On a phone the backdrop is the whole width, so the wash comes up from
                    the bottom; on a wide screen it comes in from the left, behind the text. */}
                <div className="absolute inset-0 bg-linear-to-t from-ink-950 via-ink-950/70 to-ink-950/10 sm:bg-linear-to-r sm:from-ink-950 sm:via-ink-950/85 sm:to-ink-950/20" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-ink-950 to-transparent" />
            </div>

            <div className="absolute inset-0 flex items-end pb-8 sm:items-center sm:pb-0">
                <div className="mx-auto w-full max-w-page px-4 sm:px-6 lg:px-8">
                    <div className="max-w-xl">
                        {badgeLabel(title.badge) && <Badge tone="accent">{badgeLabel(title.badge)}</Badge>}

                        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-fg-inverse sm:text-4xl">
                            {title.title}
                        </h1>

                        <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-fg-inverse-muted">
                            <span>{title.mediaType === "tv" ? "Series" : "Film"}</span>
                            {title.year && <span>· {title.year}</span>}
                            {title.voteCount > 0 && (
                                <span className="flex items-center gap-1">
                                    ·<StarIcon className="h-4 w-4 text-accent" aria-hidden="true" />
                                    <span className="tabular">{title.rating.toFixed(1)}</span>
                                </span>
                            )}
                        </p>

                        {title.overview && <p className="mt-4 line-clamp-3 text-sm text-fg-inverse-muted">{title.overview}</p>}

                        <div className="mt-6 flex flex-wrap gap-2">
                            <Button onClick={() => onOpen(title)}>
                                {title.price > 0 ? (title.canRent ? `Buy or rent from ${money(title.rentPrice)}` : `Buy for ${money(title.price)}`) : "See this title"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const MoviesView = ({ hero, rows, count, initial, signedIn }: any) => {
    const library = useMovieLibrary(initial);
    const [open, setOpen] = useState<any>(null);

    return (
        <div className="bg-ink-950 text-fg-inverse">
            <MoviesBar note={`${count} titles, from TMDB`} />

            <Hero title={hero} onOpen={setOpen} />

            <div className="mx-auto max-w-page px-4 pb-16 sm:px-6 lg:px-8">
                {rows.map((row: any) => (
                    <TitleRow
                        key={row.row}
                        title={row.label}
                        description={row.description}
                        titles={row.titles}
                        onOpen={setOpen}
                        savedIds={library.savedIds}
                        entries={library.entries}
                    />
                ))}
            </div>

            <TitleSheet
                title={open}
                open={!!open}
                onClose={() => setOpen(null)}
                signedIn={signedIn}
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

export default MoviesView;
