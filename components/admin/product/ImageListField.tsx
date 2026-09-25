"use client";

import { useState } from "react";
import Image from "next/image";
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    PhotoIcon,
    StarIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

// Items are { key, kind: "local" | "remote", file?, preview, url?, public_url? }.
// Remote items are already in Cloudinary (or, for seeded products, on the
// dummyjson CDN); local ones upload when the form is submitted.
export const toLocalItems = (files: File[]) =>
    files.map((file) => ({
        key: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
        kind: "local",
        file,
        preview: URL.createObjectURL(file),
    }));

export const toRemoteItems = (images: any[]) =>
    (images || [])
        .filter((image: any) => image?.url)
        .map((image: any) => ({
            key: image.public_url || image.url,
            kind: "remote",
            url: image.url,
            public_url: image.public_url || "",
            preview: image.url,
        }));

export const screenFiles = (files: File[]) => {
    const errors: string[] = [];
    const ok = files.filter((file) => {
        if (!TYPES.includes(file.type)) {
            errors.push(`"${file.name}" is not a JPEG, PNG or WebP image.`);
            return false;
        }

        if (file.size > MAX_BYTES) {
            errors.push(`"${file.name}" is larger than 5 MB.`);
            return false;
        }

        return true;
    });

    return { ok, errors };
};

const ImageListField = ({ id, label, hint, items, onChange, onRejected, max = 10, cover = false }: any) => {
    const [dragFrom, setDragFrom] = useState<number | null>(null);
    const [dragOver, setDragOver] = useState<number | null>(null);

    const move = (from: number, to: number) => {
        if (to < 0 || to >= items.length || from === to) {
            return;
        }

        const next = [...items];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        onChange(next);
    };

    const remove = (index: number) => {
        const item = items[index];

        if (item.kind === "local") {
            URL.revokeObjectURL(item.preview);
        }

        onChange(items.filter((_: any, i: number) => i !== index));
    };

    const add = (fileList: FileList | null) => {
        const { ok, errors } = screenFiles([...(fileList || [])]);
        const room = max - items.length;

        if (ok.length > room) {
            errors.push(`Only ${max} images are allowed here.`);
        }

        if (errors.length) {
            onRejected(errors);
        }

        onChange([...items, ...toLocalItems(ok.slice(0, Math.max(room, 0)))]);
    };

    return (
        <div>
            <div className="flex items-baseline justify-between gap-3">
                <p id={`${id}-label`} className="text-sm font-medium text-fg-muted">
                    {label}
                </p>
                <span className="text-xs text-fg-subtle">
                    {items.length} / {max}
                </span>
            </div>
            {hint && <p className="text-xs text-fg-subtle mt-0.5">{hint}</p>}

            <ul aria-labelledby={`${id}-label`} className="flex flex-wrap gap-3 mt-2">
                {items.map((item: any, index: number) => (
                    <li
                        key={item.key}
                        draggable
                        onDragStart={() => setDragFrom(index)}
                        onDragOver={(event) => {
                            event.preventDefault();
                            setDragOver(index);
                        }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={(event) => {
                            event.preventDefault();

                            if (dragFrom !== null) {
                                move(dragFrom, index);
                            }

                            setDragFrom(null);
                            setDragOver(null);
                        }}
                        onDragEnd={() => {
                            setDragFrom(null);
                            setDragOver(null);
                        }}
                        className={`group relative w-28 rounded-xl border bg-surface p-1.5 cursor-grab active:cursor-grabbing ${
                            dragOver === index && dragFrom !== index
                                ? "border-accent-ink ring-2 ring-accent-ink/30"
                                : "border-line"
                        } ${dragFrom === index ? "opacity-50" : ""}`}
                    >
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-surface-muted">
                            <Image
                                src={item.preview}
                                alt={`${label} ${index + 1}${cover && index === 0 ? " (cover)" : ""}`}
                                fill
                                sizes="112px"
                                unoptimized={item.kind === "local"}
                                className="object-contain"
                            />
                        </div>

                        {cover && index === 0 && (
                            <span className="absolute top-2 left-2 inline-flex items-center gap-0.5 rounded-full bg-ink-900 text-fg-inverse text-[10px] font-semibold px-1.5 py-0.5">
                                <StarIcon className="w-3 h-3" />
                                Cover
                            </span>
                        )}

                        <button
                            type="button"
                            onClick={() => remove(index)}
                            aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
                            className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-surface border border-line shadow flex items-center justify-center hover:bg-danger-soft hover:border-danger/40 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent-ink outline-none"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>

                        {/* Drag and drop has no keyboard path, so the order can
                            also be changed with these. */}
                        <div className="flex justify-between mt-1">
                            <button
                                type="button"
                                onClick={() => move(index, index - 1)}
                                disabled={index === 0}
                                aria-label={`Move ${label.toLowerCase()} ${index + 1} earlier`}
                                className="w-8 h-8 rounded-md flex items-center justify-center text-fg-subtle hover:bg-surface-muted disabled:opacity-30 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent-ink outline-none"
                            >
                                <ArrowLeftIcon className="w-4 h-4" />
                            </button>
                            {cover && index !== 0 && (
                                <button
                                    type="button"
                                    onClick={() => move(index, 0)}
                                    className="text-[11px] text-accent-ink hover:underline cursor-pointer"
                                >
                                    Make cover
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => move(index, index + 1)}
                                disabled={index === items.length - 1}
                                aria-label={`Move ${label.toLowerCase()} ${index + 1} later`}
                                className="w-8 h-8 rounded-md flex items-center justify-center text-fg-subtle hover:bg-surface-muted disabled:opacity-30 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent-ink outline-none"
                            >
                                <ArrowRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </li>
                ))}

                {items.length < max && (
                    <li>
                        <label className="w-28 h-[146px] rounded-xl border-2 border-dashed border-line flex flex-col items-center justify-center gap-1 text-xs text-fg-muted cursor-pointer hover:border-accent-ink hover:bg-accent-soft/40 focus-within:ring-2 focus-within:ring-accent-ink">
                            <PhotoIcon className="w-7 h-7 text-fg-subtle" />
                            Add images
                            <input
                                id={id}
                                type="file"
                                accept={TYPES.join(",")}
                                multiple
                                className="sr-only"
                                onChange={(event) => {
                                    add(event.target.files);
                                    event.target.value = "";
                                }}
                            />
                        </label>
                    </li>
                )}
            </ul>
        </div>
    );
};

export default ImageListField;
