"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { ChatBubbleLeftRightIcon, PhotoIcon } from "@heroicons/react/24/outline";

import Pagination from "@/components/ui/Pagination";
import RatingSummary from "./RatingSummary";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import { FITS, RATINGS, bucketOf, sortReviews } from "./reviewUtils";

const PER_PAGE = 3;

const control =
    "h-9 border border-slate-400 rounded-lg px-2 text-sm bg-surface-muted shadow-sm cursor-pointer outline-none focus:border-accent-ink focus:ring-2 focus:ring-accent-ink/30";

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
                (!filters.photos || (review.images || []).length > 0)
        ),
        sort
    );

    const pages = Math.max(1, Math.ceil(visible.length / PER_PAGE));
    const current = Math.min(page, pages);
    const shown = visible.slice((current - 1) * PER_PAGE, current * PER_PAGE);
    const filtering = filters.star || filters.size || filters.style || filters.fit || filters.photos;

    // The histogram is computed from the list itself, so it moves the moment a
    // review is saved instead of waiting for the page to re-render.
    const ratings = RATINGS.map((star) => ({
        percentage: reviews.length
            ? ((reviews.filter((review: any) => bucketOf(review.rating) === star).length * 100) /
                  reviews.length).toFixed(1)
            : "0",
    }));

    const sizes = [...new Set(reviews.map((review: any) => review.size).filter(Boolean))];
    const styles = [...new Set(reviews.map((review: any) => review.style?.color).filter(Boolean))];

    const writeHandler = () => {
        if (!session) {
            signIn(undefined, { callbackUrl: `${window.location.pathname}#customer-reviews` });
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

    return (
        <section
            id="customer-reviews"
            aria-labelledby="customer-reviews-heading"
            className="mt-4 mx-auto w-full md:w-4/5 p-4 md:p-6 border border-slate-200 rounded-lg scroll-mt-4"
        >
            <div className="grid md:grid-cols-[minmax(260px,1fr)_2fr] gap-8">
                <div>
                    <h2 id="customer-reviews-heading" className="text-2xl font-bold mb-3">
                        Customer reviews
                    </h2>

                    <RatingSummary
                        average={average}
                        reviews={reviews}
                        ratings={ratings}
                        filter={filters.star}
                        onFilter={(star: number) => setFilter("star", star)}
                    />

                    <div className="border-t border-slate-200 mt-6 pt-6">
                        <h3 className="text-lg font-bold">Review this product</h3>
                        <p className="text-sm text-slate-700 mt-1">
                            Share your thoughts with other customers
                        </p>
                        <button
                            onClick={writeHandler}
                            className="w-full h-11 mt-3 rounded-full border border-slate-400 bg-white hover:bg-slate-50 shadow-sm text-sm cursor-pointer"
                        >
                            {!session
                                ? "Sign in to write a review"
                                : mine
                                  ? "Update review"
                                  : "Write a customer review"}
                        </button>
                    </div>
                </div>

                <div className="min-w-0">
                    {writing && (
                        <div className="mb-6">
                            <ReviewForm
                                product={product}
                                mine={mine}
                                onSaved={onSaved}
                                onCancel={() => setWriting(false)}
                            />
                        </div>
                    )}

                    {reviews.length === 0 ? (
                        <div className="text-center border border-dashed border-slate-300 rounded-lg py-12 px-4">
                            <ChatBubbleLeftRightIcon className="w-10 h-10 mx-auto text-slate-400" />
                            <p className="font-bold mt-3">No customer reviews yet</p>
                            <p className="text-sm text-slate-600 mt-1">
                                Be the first to tell other shoppers what you think.
                            </p>
                            {!writing && (
                                <button
                                    onClick={writeHandler}
                                    className="mt-4 px-6 h-11 rounded-full bg-accent hover:bg-accent-strong border border-accent text-sm cursor-pointer"
                                >
                                    {session ? "Write a customer review" : "Sign in to write a review"}
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h3 className="text-lg font-bold">
                                    {filtering
                                        ? `${visible.length} matching review${visible.length === 1 ? "" : "s"}`
                                        : "Top reviews from customers"}
                                </h3>

                                <label className="flex items-center gap-2 text-sm">
                                    Sort by
                                    <select
                                        value={sort}
                                        onChange={(event) => {
                                            setSort(event.target.value);
                                            setPage(1);
                                        }}
                                        className={control}
                                    >
                                        <option value="top">Top reviews</option>
                                        <option value="recent">Most recent</option>
                                    </select>
                                </label>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-3" aria-label="Filter reviews">
                                <select
                                    aria-label="Filter by star rating"
                                    value={filters.star}
                                    onChange={(event) => setFilter("star", Number(event.target.value))}
                                    className={control}
                                >
                                    <option value={0}>All stars</option>
                                    {RATINGS.map((star) => (
                                        <option key={star} value={star}>
                                            {star} star only
                                        </option>
                                    ))}
                                </select>

                                {sizes.length > 0 && (
                                    <select
                                        aria-label="Filter by size"
                                        value={filters.size}
                                        onChange={(event) => setFilter("size", event.target.value)}
                                        className={control}
                                    >
                                        <option value="">All sizes</option>
                                        {sizes.map((size: any) => (
                                            <option key={size} value={size}>
                                                Size: {size}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {styles.length > 1 && (
                                    <select
                                        aria-label="Filter by style"
                                        value={filters.style}
                                        onChange={(event) => setFilter("style", event.target.value)}
                                        className={control}
                                    >
                                        <option value="">All styles</option>
                                        {styles.map((style: any, i: number) => (
                                            <option key={style} value={style}>
                                                Style {i + 1}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                <select
                                    aria-label="Filter by fit"
                                    value={filters.fit}
                                    onChange={(event) => setFilter("fit", event.target.value)}
                                    className={control}
                                >
                                    <option value="">Any fit</option>
                                    {FITS.map((fit) => (
                                        <option key={fit} value={fit}>
                                            {fit}
                                        </option>
                                    ))}
                                </select>

                                <label className="inline-flex items-center gap-2 h-9 px-3 border border-slate-400 rounded-lg text-sm bg-white cursor-pointer has-checked:bg-accent-soft has-checked:border-accent-ink">
                                    <input
                                        type="checkbox"
                                        checked={filters.photos}
                                        onChange={(event) => setFilter("photos", event.target.checked)}
                                    />
                                    <PhotoIcon className="w-4 h-4" />
                                    With photos only
                                </label>

                                {filtering ? (
                                    <button
                                        onClick={() => {
                                            setFilters({ star: 0, size: "", style: "", fit: "", photos: false });
                                            setPage(1);
                                        }}
                                        className="text-sm text-accent-ink hover:text-accent-deep hover:underline cursor-pointer"
                                    >
                                        Clear filters
                                    </button>
                                ) : null}
                            </div>

                            <div className="mt-2">
                                {shown.length === 0 ? (
                                    <p className="text-sm text-slate-600 py-8 text-center">
                                        No reviews match these filters.
                                    </p>
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

                            <Pagination page={current} count={pages} onChange={setPage} />
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Reviews;
