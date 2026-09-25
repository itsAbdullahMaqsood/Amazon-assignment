"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { ChatBubbleLeftRightIcon, CheckBadgeIcon, PhotoIcon } from "@heroicons/react/24/outline";

import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Layout";
import { cn } from "@/components/ui/cn";
import { colorName } from "@/lib/colors";
import RatingSummary from "./RatingSummary";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import { FITS, bucketOf, sortReviews } from "./reviewUtils";

const PER_PAGE = 5;

const control =
    "h-9 cursor-pointer rounded-control border border-line-strong bg-surface pl-2.5 pr-8 text-sm outline-none focus:border-accent-ink";

const toggleClass = (on: boolean) =>
    cn(
        "inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border px-3 text-sm",
        on ? "border-accent-ink bg-accent-soft text-accent-ink" : "border-line-strong bg-surface text-fg hover:border-fg-subtle"
    );

// Everything the list does — filter, sort, paginate — runs over reviews already
// on the page; only writing a review or voting goes to the server.
const Reviews = ({ product }: any) => {
    const { data: session }: any = useSession();
    const userId = session?.user?.id;

    const [reviews, setReviews] = useState<any[]>(product.reviews || []);
    const [average, setAverage] = useState<number>(Number(product.rating) || 0);
    const [writing, setWriting] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [sort, setSort] = useState<string>("top");
    const [filters, setFilters] = useState<any>({
        star: 0,
        size: "",
        style: "",
        fit: "",
        photos: false,
        verified: false,
    });

    const mine = reviews.find((review: any) => String(review.reviewBy?._id) === String(userId));

    // Any filter or sort change starts again from page one.
    const setFilter = (key: string, value: any) => {
        setFilters({ ...filters, [key]: value });
        setPage(1);
    };

    const visible = sortReviews(
        reviews.filter(
            (review: any) =>
                (!filters.star || bucketOf(review.rating) === filters.star) &&
                (!filters.size || review.size === filters.size) &&
                (!filters.style || review.style?.color === filters.style) &&
                (!filters.fit || review.fit === filters.fit) &&
                (!filters.photos || (review.images || []).length > 0) &&
                (!filters.verified || review.verified)
        ),
        sort
    );

    const pages = Math.max(1, Math.ceil(visible.length / PER_PAGE));
    const current = Math.min(page, pages);
    const shown = visible.slice((current - 1) * PER_PAGE, current * PER_PAGE);
    const filtering = filters.star || filters.size || filters.style || filters.fit || filters.photos || filters.verified;

    // A filter is only offered when the reviews actually vary on it.
    const sizes = [...new Set(reviews.map((review: any) => review.size).filter(Boolean))];
    const styles = [...new Set(reviews.map((review: any) => review.style?.color).filter(Boolean))];
    const fits = FITS.filter((fit) => reviews.some((review: any) => review.fit === fit));
    const withPhotos = reviews.some((review: any) => (review.images || []).length > 0);
    const verifiedCount = reviews.filter((review: any) => review.verified).length;

    const writeHandler = () => {
        if (!session) {
            signIn(undefined, { callbackUrl: `${window.location.pathname}#reviews` });
            return;
        }

        setWriting(true);
    };

    const onSaved = (data: any) => {
        setReviews(data.reviews);
        setAverage(Number(data.rating) || 0);
        setWriting(false);
    };

    const onVoted = (reviewId: string, liked: boolean, voter: string) => {
        setReviews(
            reviews.map((review: any) =>
                review._id === reviewId
                    ? {
                          ...review,
                          likes: liked
                              ? [...(review.likes || []), voter]
                              : (review.likes || []).filter((like: any) => String(like) !== String(voter)),
                      }
                    : review
            )
        );
    };

    const clear = () => {
        setFilters({ star: 0, size: "", style: "", fit: "", photos: false, verified: false });
        setPage(1);
    };

    return (
        <section id="reviews" aria-labelledby="reviews-heading" className="mt-14 scroll-mt-6 border-t border-line pt-10">
            <div className="grid gap-10 md:grid-cols-[18rem_1fr]">
                <div>
                    <h2 id="reviews-heading" className="font-display text-xl font-semibold tracking-tight">
                        Customer reviews
                    </h2>

                    <div className="mt-4">
                        <RatingSummary average={average} reviews={reviews} filter={filters.star} onFilter={(star: number) => setFilter("star", star)} />
                    </div>

                    <div className="mt-6 border-t border-line pt-6">
                        <p className="text-sm text-fg-muted">
                            {mine ? "You reviewed this product." : "Bought it? Tell other shoppers how it went."}
                        </p>
                        <Button variant="outline" block onClick={writeHandler} className="mt-3">
                            {!session ? "Sign in to write a review" : mine ? "Edit your review" : "Write a review"}
                        </Button>
                    </div>
                </div>

                <div className="min-w-0">
                    {writing && (
                        <div className="mb-6">
                            <ReviewForm product={product} mine={mine} onSaved={onSaved} onCancel={() => setWriting(false)} />
                        </div>
                    )}

                    {reviews.length === 0 ? (
                        !writing && (
                            <EmptyState
                                icon={ChatBubbleLeftRightIcon}
                                title="No reviews yet"
                                description="Be the first to tell other shoppers what you think."
                                action={<Button onClick={writeHandler}>{session ? "Write a review" : "Sign in to write a review"}</Button>}
                            />
                        )
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center gap-2" aria-label="Filter reviews">
                                {verifiedCount > 0 && verifiedCount < reviews.length && (
                                    <button type="button" aria-pressed={filters.verified} onClick={() => setFilter("verified", !filters.verified)} className={toggleClass(filters.verified)}>
                                        <CheckBadgeIcon className="h-4 w-4" />
                                        Verified purchases
                                    </button>
                                )}

                                {withPhotos && (
                                    <button type="button" aria-pressed={filters.photos} onClick={() => setFilter("photos", !filters.photos)} className={toggleClass(filters.photos)}>
                                        <PhotoIcon className="h-4 w-4" />
                                        With photos
                                    </button>
                                )}

                                {sizes.length > 1 && (
                                    <select aria-label="Filter by size" value={filters.size} onChange={(event) => setFilter("size", event.target.value)} className={control}>
                                        <option value="">All sizes</option>
                                        {sizes.map((size: any) => (
                                            <option key={size} value={size}>
                                                Size {size}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {styles.length > 1 && (
                                    <select aria-label="Filter by colour" value={filters.style} onChange={(event) => setFilter("style", event.target.value)} className={control}>
                                        <option value="">All colours</option>
                                        {styles.map((style: any) => (
                                            <option key={style} value={style}>
                                                {colorName(style)}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {fits.length > 0 && (
                                    <select aria-label="Filter by fit" value={filters.fit} onChange={(event) => setFilter("fit", event.target.value)} className={control}>
                                        <option value="">Any fit</option>
                                        {fits.map((fit) => (
                                            <option key={fit} value={fit}>
                                                {fit}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                <label className="ml-auto flex items-center gap-2 text-sm">
                                    <span className="text-fg-muted">Sort</span>
                                    <select
                                        value={sort}
                                        onChange={(event) => {
                                            setSort(event.target.value);
                                            setPage(1);
                                        }}
                                        className={control}
                                    >
                                        <option value="top">Most helpful</option>
                                        <option value="recent">Most recent</option>
                                    </select>
                                </label>
                            </div>

                            {filtering ? (
                                <p className="mt-3 text-sm text-fg-muted">
                                    {visible.length} matching review{visible.length === 1 ? "" : "s"} ·{" "}
                                    <button type="button" onClick={clear} className="text-link">
                                        Clear filters
                                    </button>
                                </p>
                            ) : null}

                            <div className="mt-2 divide-y divide-line">
                                {shown.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-fg-muted">No reviews match these filters.</p>
                                ) : (
                                    shown.map((review: any) => (
                                        <ReviewCard
                                            key={review._id}
                                            review={review}
                                            productId={product._id}
                                            userId={userId}
                                            onEdit={() => setWriting(true)}
                                            onVoted={onVoted}
                                        />
                                    ))
                                )}
                            </div>

                            <Pagination page={current} count={pages} onChange={setPage} className="mt-4" />
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Reviews;
