"use client";

import Link from "next/link";
import Image from "next/image";
import { StarIcon } from "@heroicons/react/24/solid";

import { money } from "@/components/ui/Price";

// A title Shabana found in Markaz Movies. Both prices come from the server, and
// the card links into the catalogue rather than offering to buy from the panel:
// buying is a decision that belongs on the title's own sheet.
const MovieSuggestion = ({ title, onNavigate }: any) => (
    <article className="flex gap-3 rounded-card border border-line bg-surface p-2.5">
        <Link href="/movies" onClick={onNavigate} className="relative h-24 w-16 shrink-0 overflow-hidden rounded-control bg-surface-muted">
            {title.posterPath && (
                <Image src={`https://image.tmdb.org/t/p/w500${title.posterPath}`} alt="" fill sizes="64px" className="object-cover" />
            )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
            <Link href="/movies" onClick={onNavigate} className="line-clamp-2 text-sm font-medium leading-snug text-fg hover:underline">
                {title.title}
            </Link>

            <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-fg-muted">
                <span>{title.mediaType === "tv" ? "Series" : "Film"}</span>
                {title.year && <span>· {title.year}</span>}
                {title.voteCount > 0 && (
                    <span className="flex items-center gap-0.5">
                        ·<StarIcon className="h-3.5 w-3.5 text-star" aria-hidden="true" />
                        <span className="tabular">{title.rating.toFixed(1)}</span>
                    </span>
                )}
            </p>

            <p className="mt-auto pt-1.5 text-sm">
                {title.price > 0 ? (
                    <>
                        <span className="font-medium tabular text-fg">{money(title.price)}</span>
                        <span className="text-fg-muted">
                            {" "}
                            to buy{title.canRent && <> · {money(title.rentPrice)} to rent</>}
                        </span>
                    </>
                ) : (
                    <span className="text-fg-muted">Not for sale on Markaz yet</span>
                )}
            </p>
        </div>
    </article>
);

export default MovieSuggestion;
