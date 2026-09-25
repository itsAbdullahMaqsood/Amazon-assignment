"use client";

import Image from "next/image";
import { StarIcon } from "@heroicons/react/24/solid";

import Sheet from "@/components/ui/Sheet";
import Button from "@/components/ui/Button";
import { money } from "@/components/ui/Price";
import { RENTAL_DAYS, daysLeft } from "@/lib/movies";

const dateOf = (value: any) => new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

// Everything the catalogue holds about one title, and the only place it can be
// bought, rented or saved. Both prices came from the server with the title.
const TitleSheet = ({ title, open, onClose, signedIn, saved, entry, busy, onSave, onRemove, onAcquire }: any) => {
    if (!title) {
        return null;
    }

    const owned = entry?.type === "buy";
    const renting = entry?.type === "rent" && daysLeft(entry.expiresAt) >= 0;
    const expired = entry?.type === "rent" && daysLeft(entry.expiresAt) < 0;

    return (
        <Sheet open={open} onClose={onClose} side="right" hideHeader bodyClassName="bg-ink-900 text-fg-inverse">
            <div className="relative aspect-video w-full bg-ink-950">
                {title.backdropPath || title.posterPath ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/w780${title.backdropPath || title.posterPath}`}
                        alt=""
                        fill
                        sizes="420px"
                        className="object-cover"
                    />
                ) : null}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-3 top-3 rounded-full bg-ink-950/70 px-3 py-1 text-sm text-fg-inverse hover:bg-ink-950 cursor-pointer"
                >
                    Close
                </button>
            </div>

            <div className="p-5">
                <h2 className="font-display text-2xl font-semibold tracking-tight">{title.title}</h2>

                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-fg-inverse-muted">
                    <span>{title.mediaType === "tv" ? "Series" : "Film"}</span>
                    {title.year && <span>· {title.year}</span>}
                    {title.voteCount > 0 && (
                        <span className="flex items-center gap-1">
                            ·
                            <StarIcon className="h-4 w-4 text-accent" aria-hidden="true" />
                            <span className="tabular">{title.rating.toFixed(1)}</span>
                            <span>from {title.voteCount.toLocaleString()} TMDB votes</span>
                        </span>
                    )}
                </p>

                {title.genres.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {title.genres.map((genre: string) => (
                            <span
                                key={genre}
                                className="rounded-full bg-fg-inverse/10 px-2 py-0.5 text-xs font-medium text-fg-inverse-muted"
                            >
                                {genre}
                            </span>
                        ))}
                    </div>
                )}

                {title.overview && <p className="mt-4 text-sm leading-relaxed text-fg-inverse-muted">{title.overview}</p>}

                <div className="mt-6 border-t border-fg-inverse/10 pt-5">
                    {owned ? (
                        <p className="text-sm">
                            <span className="font-medium">Yours to keep.</span>{" "}
                            <span className="text-fg-inverse-muted">Bought {dateOf(entry.at)} for {money(entry.price)}.</span>
                        </p>
                    ) : renting ? (
                        <p className="text-sm">
                            <span className="font-medium">Rented.</span>{" "}
                            <span className="text-fg-inverse-muted">
                                {daysLeft(entry.expiresAt)} day{daysLeft(entry.expiresAt) === 1 ? "" : "s"} left, until {dateOf(entry.expiresAt)}.
                            </span>
                        </p>
                    ) : title.price > 0 ? (
                        <>
                            {expired && <p className="mb-3 text-sm text-fg-inverse-muted">Your rental ended on {dateOf(entry.expiresAt)}.</p>}
<div className="flex flex-wrap gap-2">
                                {signedIn ? (
                                    <>
                                        <Button onClick={() => onAcquire(title, "buy")} loading={busy === "buy"}>
                                            Buy {money(title.price)}
                                        </Button>
                                        <Button variant="inverse" onClick={() => onAcquire(title, "rent")} loading={busy === "rent"}>
                                            Rent {money(title.rentPrice)}
                                        </Button>
                                    </>
                                ) : (
                                    // Signed out, the prices are still the answer to "how much";
                                    // the button just goes to sign-in rather than failing there.
                                    <Button href={`/auth/signin?callbackUrl=${encodeURIComponent("/movies")}`}>
                                        Sign in to buy {money(title.price)} or rent {money(title.rentPrice)}
                                    </Button>
                                )}
                            </div>
                            <p className="mt-2 text-xs text-fg-inverse-muted">
                                A rental plays for {RENTAL_DAYS} days. Nothing is charged: purchases here are simulated, as they
                                are in the rest of the store.
                            </p>
                        </>
                    ) : (
                        <p className="rounded-card border border-fg-inverse/15 bg-fg-inverse/5 px-4 py-3 text-sm text-fg-inverse-muted">
                            Markaz doesn&apos;t sell this title yet. You can keep it on your list and it will show a price if
                            one is ever set.
                        </p>
                    )}

                    {!owned && (
                        <div className="mt-4">
                            {signedIn ? (
                                <Button
                                    variant="inverse"
                                    size="sm"
                                    loading={busy === "save"}
                                    onClick={() => (saved ? onRemove(title) : onSave(title))}
                                >
                                    {saved ? "Remove from My list" : "Add to My list"}
                                </Button>
                            ) : (
                                <p className="text-sm text-fg-inverse-muted">
                                    <a href="/auth/signin?callbackUrl=/movies" className="underline underline-offset-2">
                                        Sign in
                                    </a>{" "}
                                    to keep a list and a library on your account.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Sheet>
    );
};

export default TitleSheet;
