"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CameraIcon, XMarkIcon } from "@heroicons/react/24/outline";

import StarRating from "@/components/shared/StarRating";
import DotLoaderSpinner from "@/components/loaders/dotLoader/DotLoaderSpinner";
import { useAppDispatch } from "@/redux/hooks";
import { showDialog } from "@/redux/slices/DialogSlice";
import { toUploadForm, uploadImages } from "@/request/upload";
import { FITS, MAX_REVIEW } from "./reviewUtils";

const MAX_PHOTOS = 3;
const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

// The messages are the ones the dialog shows, in this order, all at once.
const schema = z.object({
    size: z.string().min(1, "Please select a size!"),
    style: z.string().min(1, "Please select a style!"),
    fit: z.string().refine((value) => FITS.includes(value), "Please select a Fit!"),
    rating: z.number().min(0.5, "Please select a rating!"),
    review: z
        .string()
        .trim()
        .min(1, "Please add a review!")
        .max(MAX_REVIEW, `Reviews are limited to ${MAX_REVIEW} characters.`),
});

const ORDER = ["size", "style", "fit", "rating", "review"];

const select =
    "w-full h-11 border border-slate-400 rounded-lg px-3 text-sm bg-[#F0F2F2] shadow-sm outline-none focus:border-[#007185] focus:ring-2 focus:ring-[#007185]/30";

const ReviewForm = ({ product, mine, onSaved, onCancel }: any) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [saving, setSaving] = useState<boolean>(false);

    // Photos already on the review (remote) and photos picked now (local files
    // with an object-URL preview) share one list, capped at three.
    const [photos, setPhotoState] = useState<any[]>(
        (mine?.images || []).map((image: any) => ({ kind: "remote", ...image, preview: image.url }))
    );
    // Mirrors the list for the unmount cleanup below; written only from the
    // handlers, never during render.
    const photosRef = useRef<any[]>([]);

    const setPhotos = (next: any[]) => {
        photosRef.current = next;
        setPhotoState(next);
    };

    // Object URLs are released when the form goes away.
    useEffect(
        () => () =>
            photosRef.current
                .filter((photo) => photo.kind === "local")
                .forEach((photo) => URL.revokeObjectURL(photo.preview)),
        []
    );

    const sizes = (product.allSizes || []).map((row: any) => String(row.size));
    const colors = (product.colors || []).filter((c: any) => c?.color);

    const { control, register, handleSubmit } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            size: mine?.size || "",
            style: mine?.style?.color || "",
            fit: mine?.fit || "",
            rating: Number(mine?.rating) || 0,
            review: mine?.review || "",
        },
    });

    const addPhotos = (files: FileList | null) => {
        const picked = [...(files || [])];
        const errors: any[] = [];
        const room = MAX_PHOTOS - photos.length;

        const accepted = picked.filter((file) => {
            if (!TYPES.includes(file.type)) {
                errors.push({ msg: `"${file.name}" is not a JPEG, PNG or WebP image.`, type: "error" });
                return false;
            }

            if (file.size > MAX_BYTES) {
                errors.push({ msg: `"${file.name}" is larger than 5 MB.`, type: "error" });
                return false;
            }

            return true;
        });

        if (accepted.length > room) {
            errors.push({ msg: `You can add up to ${MAX_PHOTOS} photos.`, type: "error" });
        }

        if (errors.length) {
            dispatch(showDialog({ header: "Some photos were not added", msgs: errors }));
        }

        setPhotos([
            ...photos,
            ...accepted.slice(0, Math.max(room, 0)).map((file) => ({
                kind: "local",
                file,
                preview: URL.createObjectURL(file),
            })),
        ]);
    };

    const removePhoto = (index: number) => {
        const photo = photos[index];

        if (photo.kind === "local") {
            URL.revokeObjectURL(photo.preview);
        }

        setPhotos(photos.filter((_, i) => i !== index));
    };

    const onInvalid = (errors: any) => {
        dispatch(
            showDialog({
                header: "Please check your review",
                msgs: ORDER.filter((key) => errors[key]).map((key) => ({
                    msg: errors[key].message,
                    type: "error",
                })),
            })
        );
    };

    const onValid = async (values: any) => {
        try {
            setSaving(true);

            const local = photos.filter((photo) => photo.kind === "local");
            const uploaded = local.length
                ? await uploadImages(
                      toUploadForm(
                          local.map((photo) => photo.file),
                          `reviews/${product._id}`
                      )
                  )
                : [];

            const images = [
                ...photos
                    .filter((photo) => photo.kind === "remote")
                    .map(({ url, public_url }: any) => ({ url, public_url })),
                ...uploaded,
            ];

            const colour = colors.find((c: any) => c.color === values.style);

            const { data } = await axios.put(`/api/product/${product._id}/review`, {
                rating: values.rating,
                review: values.review,
                size: values.size,
                style: { color: colour?.color, image: colour?.image || "" },
                fit: values.fit,
                images,
            });

            dispatch(
                showDialog({
                    header: mine ? "Review updated" : "Review submitted",
                    msgs: [{ msg: data.message, type: "success" }],
                })
            );

            onSaved(data);
            // The product's average and count live in the server-rendered parts of
            // the page (buy box, cards), so they are re-fetched too.
            router.refresh();
        } catch (error: any) {
            dispatch(
                showDialog({
                    header: "Your review was not saved",
                    msgs: [{ msg: error.response?.data?.message || error.message, type: "error" }],
                })
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onValid, onInvalid)}
            noValidate
            className="border border-slate-300 rounded-lg p-4 md:p-5 bg-white"
        >
            {saving && <DotLoaderSpinner loading={saving} />}

            <h3 className="text-lg font-bold">{mine ? "Edit your review" : "Create review"}</h3>

            <div className="mt-4">
                <p className="text-sm font-bold mb-1" id="rating-label">
                    Overall rating
                </p>
                <Controller
                    control={control}
                    name="rating"
                    render={({ field }) => (
                        <div className="flex items-center gap-3">
                            <StarRating
                                value={field.value}
                                onChange={field.onChange}
                                size="w-8 h-8"
                                label="Overall rating"
                            />
                            <span className="text-sm text-slate-600">
                                {field.value ? `${field.value} out of 5` : "Click to rate"}
                            </span>
                        </div>
                    )}
                />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-5">
                <label className="block">
                    <span className="text-sm font-bold">Size</span>
                    <select {...register("size")} className={`${select} mt-1`}>
                        <option value="">Select a size</option>
                        {sizes.map((size: string) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="block">
                    <span className="text-sm font-bold">How does it fit?</span>
                    <select {...register("fit")} className={`${select} mt-1`}>
                        <option value="">Select a fit</option>
                        {FITS.map((fit) => (
                            <option key={fit} value={fit}>
                                {fit}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <fieldset className="mt-5">
                <legend className="text-sm font-bold">Style</legend>
                <Controller
                    control={control}
                    name="style"
                    render={({ field }) => (
                        <div className="flex flex-wrap gap-3 mt-2" role="radiogroup" aria-label="Style">
                            {colors.map((colour: any, i: number) => {
                                const active = field.value === colour.color;

                                return (
                                    <button
                                        key={`${colour.color}-${i}`}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        aria-label={`Style ${i + 1}`}
                                        onClick={() => field.onChange(colour.color)}
                                        className={`w-11 h-11 rounded-full overflow-hidden border-2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#007185] focus-visible:ring-offset-2 ${
                                            active ? "border-[#007185]" : "border-slate-300"
                                        }`}
                                    >
                                        {colour.image ? (
                                            <Image
                                                src={colour.image}
                                                alt=""
                                                width={44}
                                                height={44}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span
                                                className="block w-full h-full"
                                                style={{ backgroundColor: colour.color }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                />
            </fieldset>

            <label className="block mt-5">
                <span className="text-sm font-bold">Write your review</span>
                <textarea
                    {...register("review")}
                    rows={5}
                    maxLength={MAX_REVIEW}
                    placeholder="What did you like or dislike? What did you use this product for?"
                    className="mt-1 w-full border border-slate-400 rounded-lg p-3 text-sm outline-none focus:border-[#007185] focus:ring-2 focus:ring-[#007185]/30"
                />
            </label>

            <div className="mt-5">
                <p className="text-sm font-bold">Add photos</p>
                <p className="text-xs text-slate-600">
                    Shoppers find images more helpful than text alone. Up to {MAX_PHOTOS}, JPEG, PNG
                    or WebP, 5 MB each.
                </p>

                <div className="flex flex-wrap gap-3 mt-2">
                    {photos.map((photo, i) => (
                        <div key={photo.preview} className="relative w-24 h-24">
                            <Image
                                src={photo.preview}
                                alt={`Review photo ${i + 1}`}
                                fill
                                sizes="96px"
                                unoptimized={photo.kind === "local"}
                                className="object-cover rounded-lg border border-slate-300"
                            />
                            <button
                                type="button"
                                onClick={() => removePhoto(i)}
                                aria-label={`Remove photo ${i + 1}`}
                                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border border-slate-400 shadow flex items-center justify-center cursor-pointer hover:bg-slate-100"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    {photos.length < MAX_PHOTOS && (
                        <label className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-400 flex flex-col items-center justify-center text-xs text-slate-600 cursor-pointer hover:bg-slate-50 focus-within:ring-2 focus-within:ring-[#007185]">
                            <CameraIcon className="w-7 h-7" />
                            Add photo
                            <input
                                type="file"
                                accept={TYPES.join(",")}
                                multiple
                                className="sr-only"
                                onChange={(event) => {
                                    addPhotos(event.target.files);
                                    event.target.value = "";
                                }}
                            />
                        </label>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
                <button
                    type="submit"
                    disabled={saving}
                    className="px-6 h-11 rounded-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-sm cursor-pointer disabled:opacity-60"
                >
                    {saving ? "Saving…" : mine ? "Update review" : "Submit review"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 h-11 rounded-full border border-slate-400 bg-white hover:bg-slate-50 text-sm cursor-pointer"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default ReviewForm;
