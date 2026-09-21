"use client";

import { useState } from "react";
import Image from "next/image";
import axios from "axios";
import { signIn } from "next-auth/react";
import { CheckBadgeIcon, HandThumbUpIcon } from "@heroicons/react/24/solid";

import StarRating from "@/components/shared/StarRating";
import Lightbox from "@/components/shared/Lightbox";
import { formatDate } from "@/lib/localStore";
import { initialOf, likeCount, likedBy, splitReview } from "./reviewUtils";

// Long enough that clamping to four lines hides something worth a "Read more".
const LONG = 280;

const Chip = ({ children }: any) => (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-[#F0F2F2] border border-slate-300 rounded-full px-2.5 py-0.5">
        {children}
    </span>
);

const ReviewCard = ({ review, productId, userId, onEdit, onVoted }: any) => {
    const [expanded, setExpanded] = useState<boolean>(false);
    const [photo, setPhoto] = useState<number | null>(null);
    const [voting, setVoting] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const { title, body } = splitReview(review.review);
    const mine = userId && String(review.reviewBy?._id) === String(userId);
    const liked = likedBy(review, userId);
    const helpful = likeCount(review);
    const date = review.createdAt ? formatDate(review.createdAt) : "";
    const images = review.images || [];

    const voteHandler = async () => {
        if (!userId) {
            signIn(undefined, { callbackUrl: `${window.location.pathname}#customer-reviews` });
            return;
        }

        try {
            setVoting(true);
            setError("");

            const { data } = await axios.put(`/api/product/${productId}/review/like`, {
                review_id: review._id,
            });

            // The parent owns the list, so the new likes go back up to it.
            onVoted(review._id, data.liked, userId);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setVoting(false);
        }
    };

    return (
        <article className="py-5 border-b border-slate-200 last:border-b-0">
            <div className="flex items-center gap-2">
                {review.reviewBy?.image ? (
                    <Image
                        src={review.reviewBy.image}
                        alt=""
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                ) : (
                    <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-semibold">
                        {initialOf(review.reviewBy?.name)}
                    </span>
                )}
                <span className="text-sm">{review.reviewBy?.name || "Amazon Customer"}</span>
                {mine && <Chip>Your review</Chip>}
            </div>

            <div className="flex items-center gap-2 mt-2">
                <StarRating value={review.rating} size="w-4 h-4" />
                {title && <h4 className="font-bold text-sm text-[#0F1111]">{title}</h4>}
            </div>

            {date && <p className="text-sm text-slate-600 mt-1">Reviewed on {date}</p>}

            <div className="flex flex-wrap items-center gap-2 mt-2">
                {review.size && <Chip>Size: {review.size}</Chip>}
                {review.style?.color && (
                    <Chip>
                        Colour:
                        {review.style.image ? (
                            <Image
                                src={review.style.image}
                                alt=""
                                width={14}
                                height={14}
                                className="w-3.5 h-3.5 rounded-full object-cover"
                            />
                        ) : (
                            <span
                                aria-hidden="true"
                                className="w-3.5 h-3.5 rounded-full border border-slate-400"
                                style={{ backgroundColor: review.style.color }}
                            />
                        )}
                    </Chip>
                )}
                {review.fit && <Chip>Fit: {review.fit}</Chip>}
                {review.verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#C45500]">
                        <CheckBadgeIcon className="w-4 h-4" />
                        Verified Purchase
                    </span>
                )}
            </div>

            {body && (
                <p
                    className={`text-sm text-[#0F1111] mt-2 whitespace-pre-line ${
                        body.length > LONG && !expanded ? "line-clamp-4" : ""
                    }`}
                >
                    {body}
                </p>
            )}

            {body.length > LONG && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    aria-expanded={expanded}
                    className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline mt-1 cursor-pointer"
                >
                    {expanded ? "Read less" : "Read more"}
                </button>
            )}

            {images.length > 0 && (
                <div className="flex gap-2 mt-3">
                    {images.map((image: any, i: number) => (
                        <button
                            key={image.public_url || image.url}
                            onClick={() => setPhoto(i)}
                            aria-label={`Open photo ${i + 1} of ${images.length}`}
                            className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-300 cursor-pointer hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#007185]"
                        >
                            <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
                        </button>
                    ))}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-3">
                {helpful > 0 && (
                    <span className="text-xs text-slate-600">
                        {helpful} {helpful === 1 ? "person" : "people"} found this helpful
                    </span>
                )}

                {mine ? (
                    <button
                        onClick={onEdit}
                        className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer"
                    >
                        Edit your review
                    </button>
                ) : (
                    <button
                        onClick={voteHandler}
                        disabled={voting}
                        aria-pressed={liked}
                        className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-full border text-sm shadow-sm cursor-pointer disabled:opacity-60 ${
                            liked
                                ? "bg-[#EDFDFF] border-[#007185] text-[#007185]"
                                : "bg-white border-slate-400 hover:bg-slate-50"
                        }`}
                    >
                        <HandThumbUpIcon className="w-4 h-4" />
                        {liked ? "Helpful ✓" : "Helpful"}
                    </button>
                )}

                {error && <span className="text-xs text-red-600">{error}</span>}
            </div>

            <Lightbox
                images={images}
                index={photo}
                onIndex={setPhoto}
                onClose={() => setPhoto(null)}
                label="Customer photo"
            />
        </article>
    );
};

export default ReviewCard;
