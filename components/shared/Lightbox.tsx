"use client";

import { useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";

import useFocusTrap from "./useFocusTrap";

// Full-screen image viewer: arrow buttons and arrow keys step through the set,
// Escape or the backdrop closes it, and focus stays inside while it is open.
const Lightbox = ({ images, index, onIndex, onClose, label = "Photo" }: any) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const open = index !== null && index !== undefined && images?.[index];

    useFocusTrap(ref, Boolean(open), onClose);

    if (!open || typeof document === "undefined") {
        return null;
    }

    const count = images.length;
    const go = (step: number) => onIndex((index + step + count) % count);

    return createPortal(
        <div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={`${label} ${index + 1} of ${count}`}
            onClick={onClose}
            onKeyDown={(event) => {
                if (event.key === "ArrowRight") go(1);
                if (event.key === "ArrowLeft") go(-1);
            }}
            className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4"
        >
            <button
                onClick={onClose}
                aria-label="Close photo"
                className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full text-white hover:bg-white/10 cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
            >
                <XMarkIcon className="w-7 h-7" />
            </button>

            {count > 1 && (
                <button
                    onClick={(event) => {
                        event.stopPropagation();
                        go(-1);
                    }}
                    aria-label="Previous photo"
                    className="absolute left-2 md:left-6 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
            )}

            <div
                onClick={(event) => event.stopPropagation()}
                className="relative w-full max-w-3xl h-[75vh]"
            >
                <Image
                    src={images[index].url}
                    alt={`${label} ${index + 1} of ${count}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="object-contain"
                />
            </div>

            {count > 1 && (
                <button
                    onClick={(event) => {
                        event.stopPropagation();
                        go(1);
                    }}
                    aria-label="Next photo"
                    className="absolute right-2 md:right-6 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
                >
                    <ChevronRightIcon className="w-6 h-6" />
                </button>
            )}

            <p className="absolute bottom-4 text-sm text-white/80">
                {index + 1} / {count}
            </p>
        </div>,
        document.body
    );
};

export default Lightbox;
