"use client";

import { useState } from "react";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { HandThumbUpIcon } from "@heroicons/react/24/outline";

import StarRating from "@/components/shared/StarRating";
import { useAppDispatch } from "@/redux/hooks";
import { showDialog } from "@/redux/slices/DialogSlice";
import { formatDate } from "@/lib/localStore";
import { initialOf, likeCount, likedBy, splitReview, variantLabel } from "./reviewUtils";

const ReviewCard = ({ productId, review, onEdit, mine }: any) => {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { data: session }: any = useSession();

    const stored = {
        count: likeCount(review),
        liked: likedBy(review, session?.user?.id),
    };

    const [busy, setBusy] = useState<boolean>(false);
    const [vote, setVote] = useState(stored);
    const [tracked, setTracked] = useState(stored);

    // Adjusting state while rendering rather than in an effect: a refreshed page
    // (or a sign-in) brings new stored likes, and the button follows them instead
    // of keeping whatever the last click left behind.
    if (tracked.count !== stored.count || tracked.liked !== stored.liked) {
        setTracked(stored);
        setVote(stored);
    }

    const { title, body } = splitReview(review.review);
    const variant = variantLabel(review);
    // Reviews seeded before the schema was timestamped have no date at all, and
    // formatDate returns an empty string for those rather than "Invalid Date".
    const date = formatDate(review.createdAt);

    const helpfulHandler = async () => {
        if (!session) {
            router.push(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`);
            return;
        }

        setBusy(true);

        try {
            const { data } = await axios.patch(`/api/product/${productId}/review`, {
                review_id: review._id,
            });

            setVote({ count: data.likes, liked: data.liked });
            setTracked({ count: data.likes, liked: data.liked });
        } catch (error: any) {
            dispatch(
                showDialog({
                    header: "Helpful vote",
                    msgs: [
                        {
                            msg: error.response?.data?.message || error.message,
                            type: "error",
                        },
                    ],
                })
            );
        }

        setBusy(false);
    };

    return (
        <article className="py-5 border-b border-slate-200 last:border-b-0">
            <div className="flex items-center gap-2">
                <span
                    aria-hidden="true"
                    className="w-8 h-8 shrink-0 rounded-full bg-slate-300 text-slate-800 text-sm font-semibold flex items-center justify-center"
                >
                    {initialOf(review.reviewBy?.name)}
                </span>

                <span className="text-sm font-medium text-slate-800">
                    {review.reviewBy?.name || "Amazon customer"}
                </span>

                {mine && (
                    <span className="text-xs text-slate-500 border border-slate-300 rounded-full px-2 py-0.5">
                        Your review
                    </span>
                )}
            </div>

            <div className="flex items-center gap-2 mt-2">
                <StarRating value={review.rating} size="w-4 h-4" />
                {title && <h4 className="font-bold text-sm">{title}</h4>}
            </div>

            {(date || variant) && (
                <p className="text-xs text-slate-600 mt-1">
                    {[date && `Reviewed on ${date}`, variant].filter(Boolean).join(" · ")}
                </p>
            )}

            {review.verified && (
                <p className="flex items-center gap-1 text-xs font-semibold text-[#C45500] mt-1">
                    <CheckBadgeIcon className="w-4 h-4" />
                    Verified Purchase
                </p>
            )}

            {body && <p className="text-sm mt-2 whitespace-pre-line">{body}</p>}

            {review.fit && (
                <p className="text-xs text-slate-600 mt-2">
                    <span className="font-semibold">Fit:</span> {review.fit}
                </p>
            )}

            <div className="flex items-center gap-3 mt-3">
                <button
                    type="button"
                    onClick={helpfulHandler}
                    disabled={busy}
                    aria-pressed={vote.liked}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border border-slate-400 shadow-sm hover:bg-slate-100 ${
                        busy ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                    } ${vote.liked ? "bg-slate-100 font-semibold" : "bg-white"}`}
                >
                    <HandThumbUpIcon className="w-4 h-4" />
                    {vote.liked ? "Marked helpful" : "Helpful"}
                    {vote.count > 0 && <span className="text-slate-600">({vote.count})</span>}
                </button>

                {mine && (
                    <button
                        type="button"
                        onClick={onEdit}
                        className="text-xs text-[#0F5FA6] hover:text-[#C7511F] hover:underline cursor-pointer"
                    >
                        Edit your review
                    </button>
                )}
            </div>
        </article>
    );
};

export default ReviewCard;
