"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import RatingSummary from "./RatingSummary";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import { bucketOf, sortReviews } from "./reviewUtils";

// Sorting and filtering are client-side on purpose: every review is already on the
// page, so neither needs a round trip. Only writing a review does.
const Reviews = ({ product }: any) => {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session }: any = useSession();

    const reviews = product.reviews || [];

    const [sort, setSort] = useState<string>("top");
    const [filter, setFilter] = useState<number>(0);
    const [openForm, setOpenForm] = useState<boolean>(false);

    const mine = reviews.find(
        (review: any) => String(review.reviewBy?._id) === String(session?.user?.id)
    );

    const visible = sortReviews(
        filter ? reviews.filter((review: any) => bucketOf(review.rating) === filter) : reviews,
        sort
    );

    const writeHandler = () => {
        if (!session) {
            router.push(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`);
            return;
        }

        setOpenForm(true);
    };

    return (
        <section
            id="customer-reviews"
            aria-labelledby="customer-reviews-heading"
            className="mt-4 mx-auto w-full md:w-4/5 p-4 border border-slate-200 rounded-lg"
        >
            <div className="grid md:grid-cols-5 gap-6">
                <div className="md:col-span-3">
                    <h2 id="customer-reviews-heading" className="text-xl font-bold mb-3">
                        Customer reviews
                    </h2>

                    <RatingSummary
                        average={product.rating}
                        reviews={reviews}
                        ratings={product.ratings}
                        filter={filter}
                        onFilter={setFilter}
                    />
                </div>

                <aside className="md:col-span-2 md:border-l md:border-slate-200 md:pl-6 max-md:border-t max-md:border-slate-200 max-md:pt-4">
                    <h3 className="text-lg font-bold">Review this product</h3>
                    <p className="text-sm text-slate-600 mt-1">
                        Share your thoughts with other customers.
                    </p>

                    <button
                        type="button"
                        onClick={writeHandler}
                        className="w-full mt-3 px-4 py-1.5 text-sm bg-white border border-slate-400 rounded-full shadow-sm hover:bg-slate-100 cursor-pointer"
                    >
                        {mine ? "Edit your review" : "Write a customer review"}
                    </button>

                    {!session && (
                        <p className="text-xs text-slate-600 mt-2">
                            You will be asked to sign in first.
                        </p>
                    )}
                </aside>
            </div>

            {openForm && (
                <ReviewForm
                    key={mine?._id || "new"}
                    product={product}
                    existing={mine}
                    onCancel={() => setOpenForm(false)}
                />
            )}

            <div className="h-px w-full bg-slate-200 my-5" />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-bold">
                    {filter ? `${filter} star reviews` : "Top reviews from customers"}
                </h3>

                {/* Nothing to order or narrow down until there is a review. */}
                <div className={`items-center gap-2 ${reviews.length ? "flex" : "hidden"}`}>
                    {filter > 0 && (
                        <button
                            type="button"
                            onClick={() => setFilter(0)}
                            className="text-sm text-[#0F5FA6] hover:text-[#C7511F] hover:underline cursor-pointer"
                        >
                            Clear filter
                        </button>
                    )}

                    <label htmlFor="review-sort" className="text-sm text-slate-700">
                        Sort by
                    </label>

                    <select
                        id="review-sort"
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="p-1.5 text-sm bg-white border border-slate-400 rounded cursor-pointer"
                    >
                        <option value="top">Top reviews</option>
                        <option value="recent">Most recent</option>
                    </select>
                </div>
            </div>

            {reviews.length === 0 ? (
                <div className="py-8 text-center">
                    <p className="font-semibold">No customer reviews yet</p>
                    <p className="text-sm text-slate-600 mt-1">
                        Be the first to tell other shoppers what you think of this product.
                    </p>

                    <button
                        type="button"
                        onClick={writeHandler}
                        className="mt-3 px-6 py-1.5 text-sm bg-white border border-slate-400 rounded-full shadow-sm hover:bg-slate-100 cursor-pointer"
                    >
                        Write a customer review
                    </button>
                </div>
            ) : visible.length === 0 ? (
                <div className="py-8 text-center">
                    <p className="font-semibold">No {filter} star reviews yet</p>
                    <button
                        type="button"
                        onClick={() => setFilter(0)}
                        className="mt-2 text-sm text-[#0F5FA6] hover:text-[#C7511F] hover:underline cursor-pointer"
                    >
                        Show all {reviews.length} reviews
                    </button>
                </div>
            ) : (
                <div className="mt-1">
                    {visible.map((review: any) => (
                        <ReviewCard
                            key={review._id}
                            productId={product._id}
                            review={review}
                            mine={review === mine}
                            onEdit={() => setOpenForm(true)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default Reviews;
