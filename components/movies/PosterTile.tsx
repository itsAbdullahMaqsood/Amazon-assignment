"use client";

import Image from "next/image";
import { BookmarkIcon } from "@heroicons/react/24/solid";

import { money } from "@/components/ui/Price";
import { cn } from "@/components/ui/cn";

// One title. The whole poster is the button: it opens the sheet, which is the
// only place a title can be bought, rented or saved, so there is one answer to
// "what happens if I click this".
const PosterTile = ({ title, onOpen, saved, owned, landscape = false, className = "", footer }: any) => {
    const path = landscape && title.backdropPath ? title.backdropPath : title.posterPath;
    const size = landscape && title.backdropPath ? "w780" : "w500";

    return (
        <article className={cn("group", className)}>
            <button
                type="button"
                onClick={() => onOpen(title)}
                className={cn(
                    "relative block w-full overflow-hidden rounded-card bg-fg-inverse/10 cursor-pointer",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    landscape ? "aspect-video" : "aspect-2/3"
                )}
            >
                {path && (
                    <Image
                        src={`https://image.tmdb.org/t/p/${size}${path}`}
                        alt={title.title}
                        fill
                        sizes={landscape ? "320px" : "(max-width: 768px) 45vw, 200px"}
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                )}

                {owned && (
                    <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-fg">
                        In your library
                    </span>
                )}

                {!owned && saved && (
                    <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink-950/80 text-accent">
                        <BookmarkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                )}

                {title.price > 0 && !owned && (
                    <span className="absolute bottom-2 right-2 rounded-full bg-ink-950/80 px-2 py-0.5 text-xs font-medium tabular text-fg-inverse">
                        {money(title.price)}
                    </span>
                )}
            </button>

            <p className="mt-2 line-clamp-2 text-sm font-medium text-fg-inverse">{title.title}</p>
            <p className="text-xs text-fg-inverse-muted">
                {title.year}
                {title.year && " · "}
                {title.mediaType === "tv" ? "Series" : "Film"}
            </p>
            {footer}
        </article>
    );
};

export default PosterTile;
