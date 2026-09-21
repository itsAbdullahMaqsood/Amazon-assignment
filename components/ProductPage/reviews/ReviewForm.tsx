"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import StarRating from "@/components/shared/StarRating";
import DotLoaderSpinner from "@/components/loaders/dotLoader/DotLoaderSpinner";
import { useAppDispatch } from "@/redux/hooks";
import { showDialog } from "@/redux/slices/DialogSlice";
import { FITS, MAX_REVIEW, MIN_REVIEW } from "./reviewUtils";

// Defaults to the variant the URL is already showing, because that is the one the
// shopper was looking at when they pressed the button.
const defaultColor = (product: any, existing: any) => {
    const stored = (product.colors || []).findIndex(
        (color: any) => color.color === existing?.style?.color
    );

    return stored > -1 ? stored : product.style || 0;
};

const ReviewForm = ({ product, existing, onCancel }: any) => {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [rating, setRating] = useState<number>(Number(existing?.rating) || 0);
    const [size, setSize] = useState<string>(
        existing?.size || product.sizes?.[product.size]?.size || ""
    );
    const [colorIndex, setColorIndex] = useState<number>(defaultColor(product, existing));
    const [fit, setFit] = useState<string>(existing?.fit || "");
    const [text, setText] = useState<string>(existing?.review || "");

    const trimmed = text.trim();

    // The stars are buttons, so Tab and Enter already work; the arrow keys are
    // added because that is what a rating widget is expected to answer to.
    const arrowHandler = (e: any) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            setRating(Math.min(rating + 1, 5));
        } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            setRating(Math.max(rating - 1, 1));
        }
    };

    const submitHandler = async (e: any) => {
        e.preventDefault();

        if (rating < 1) {
            setError("Please pick a star rating first.");
            return;
        }

        if (trimmed.length < MIN_REVIEW) {
            setError(`Please write at least ${MIN_REVIEW} characters so the review is useful.`);
            return;
        }

        setError("");
        setLoading(true);

        try {
            const { data } = await axios.post(`/api/product/${product._id}/review`, {
                rating,
                review: trimmed,
                size,
                style: {
                    color: product.colors?.[colorIndex]?.color || "",
                    image: product.colors?.[colorIndex]?.image || "",
                },
                fit,
            });

            dispatch(
                showDialog({
                    header: "Customer review",
                    msgs: [{ msg: data.message, type: "success" }],
                })
            );

            onCancel();
            // The page owns the reviews, the average and the histogram, so the
            // server render is what has to be re-run after a submission.
            router.refresh();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        }

        setLoading(false);
    };

    return (
        <form
            onSubmit={submitHandler}
            className="relative mt-4 p-4 border border-slate-300 rounded-lg bg-[#F7FAFA]"
        >
            {loading && <DotLoaderSpinner loading={loading} />}

            <h3 className="font-bold">
                {existing ? "Edit your review" : "Write a customer review"}
            </h3>

            <div className="mt-3">
                <p id="review-rating-label" className="text-sm font-semibold">
                    Overall rating
                </p>

                <div
                    role="group"
                    aria-labelledby="review-rating-label"
                    onKeyDown={arrowHandler}
                    className="flex items-center gap-2 mt-1"
                >
                    <StarRating value={rating} precision={1} size="w-7 h-7" onChange={setRating} />
                    <span aria-live="polite" className="text-sm text-slate-700">
                        {rating ? `${rating} out of 5` : "Select a rating"}
                    </span>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mt-4">
                <div>
                    <label htmlFor="review-size" className="block text-sm font-semibold">
                        Size you are reviewing
                    </label>
                    <select
                        id="review-size"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        className="w-full mt-1 p-2 text-sm bg-white border border-slate-400 rounded cursor-pointer"
                    >
                        {(product.sizes || []).map((row: any, i: number) => (
                            <option key={i} value={row.size}>
                                {row.size}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="review-color" className="block text-sm font-semibold">
                        Colour you are reviewing
                    </label>
                    <select
                        id="review-color"
                        value={colorIndex}
                        onChange={(e) => setColorIndex(Number(e.target.value))}
                        className="w-full mt-1 p-2 text-sm bg-white border border-slate-400 rounded cursor-pointer"
                    >
                        {(product.colors || []).map((color: any, i: number) => (
                            <option key={i} value={i}>
                                {color.color || `Colour ${i + 1}`}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <fieldset className="mt-4">
                <legend className="text-sm font-semibold">How does it fit? (optional)</legend>

                <div className="flex flex-wrap gap-4 mt-1">
                    {FITS.map((option) => (
                        <label key={option} className="flex items-center gap-1.5 text-sm cursor-pointer">
                            <input
                                type="radio"
                                name="review-fit"
                                value={option}
                                checked={fit === option}
                                onChange={() => setFit(option)}
                                className="cursor-pointer"
                            />
                            {option}
                        </label>
                    ))}

                    {fit && (
                        <button
                            type="button"
                            onClick={() => setFit("")}
                            className="text-sm text-[#0F5FA6] hover:text-[#C7511F] hover:underline cursor-pointer"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </fieldset>

            <div className="mt-4">
                <label htmlFor="review-text" className="block text-sm font-semibold">
                    Add a written review
                </label>
                <textarea
                    id="review-text"
                    rows={5}
                    value={text}
                    maxLength={MAX_REVIEW}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="What did you like or dislike? What did you use this product for?"
                    className="w-full mt-1 p-2 text-sm bg-white border border-slate-400 rounded"
                />
                <p className="text-xs text-slate-600">
                    {trimmed.length}/{MAX_REVIEW} characters — at least {MIN_REVIEW} to submit.
                </p>
            </div>

            {error && (
                <p role="alert" className="text-sm font-semibold text-[#B12704] mt-2">
                    {error}
                </p>
            )}

            <div className="flex items-center gap-3 mt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className={`button-orange px-8 py-1.5 text-sm ${
                        loading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                    }`}
                >
                    {existing ? "Update review" : "Submit review"}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-1.5 text-sm bg-white border border-slate-400 rounded-sm shadow-sm hover:bg-slate-100 cursor-pointer"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default ReviewForm;
