"use client";

import PosterTile from "./PosterTile";

// A row of titles that scrolls sideways and snaps, the same behaviour the store
// rows use, rather than a pair of hover-only arrows a phone never sees.
const TitleRow = ({ title, description, titles, onOpen, savedIds, entries }: any) => {
    if (!titles.length) {
        return null;
    }

    return (
        <section className="mt-9">
            <div className="flex items-baseline gap-3">
                <h2 className="font-display text-xl font-semibold tracking-tight text-fg-inverse">{title}</h2>
                {description && <p className="text-sm text-fg-inverse-muted">{description}</p>}
            </div>

            <div className="scroll-row mt-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                {titles.map((entry: any) => (
                    <PosterTile
                        key={entry._id}
                        title={entry}
                        onOpen={onOpen}
                        saved={savedIds.has(entry._id)}
                        owned={entries.get(entry._id)?.type === "buy"}
                        className="w-36 shrink-0 sm:w-40"
                    />
                ))}
            </div>
        </section>
    );
};

export default TitleRow;
