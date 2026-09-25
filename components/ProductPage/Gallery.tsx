"use client";

import { useState } from "react";
import Image from "next/image";
import { MagnifyingGlassPlusIcon } from "@heroicons/react/24/outline";

import Lightbox from "@/components/shared/Lightbox";
import { cn } from "@/components/ui/cn";

// One large image and a row of thumbnails. On phones the large image is a
// swipeable strip; tapping any image opens it full screen.
const Gallery = ({ images = [], name, preview }: any) => {
    const [active, setActive] = useState(0);
    const [zoom, setZoom] = useState<number | null>(null);
    const [lastImages, setLastImages] = useState(images);

    // A new colour brings new images: start from its first.
    if (lastImages !== images) {
        setLastImages(images);
        setActive(0);
    }

    const main = preview || images[active]?.url;

    return (
        <div className="min-w-0">
            {/* Phones: a snap-scrolling strip. */}
            <div className="scroll-row -mx-4 gap-0 px-0 md:hidden">
                {images.map((image: any, i: number) => (
                    <button
                        key={image.url}
                        type="button"
                        onClick={() => setZoom(i)}
                        aria-label={`Open image ${i + 1} of ${images.length}`}
                        className="relative aspect-square w-screen bg-surface-muted"
                    >
                        <Image src={image.url} alt={i === 0 ? name : ""} fill sizes="100vw" priority={i === 0} className="object-contain p-6" />
                        <span className="absolute bottom-3 right-3 rounded-full bg-surface/90 px-2 py-0.5 text-xs text-fg-muted tabular">
                            {i + 1}/{images.length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Tablets and up: thumbnails beside the main image. */}
            <div className="hidden gap-3 md:flex">
                {images.length > 1 && (
                    <ul className="flex w-16 shrink-0 flex-col gap-2">
                        {images.map((image: any, i: number) => (
                            <li key={image.url}>
                                <button
                                    type="button"
                                    onClick={() => setActive(i)}
                                    onMouseEnter={() => setActive(i)}
                                    aria-label={`Show image ${i + 1}`}
                                    aria-current={active === i}
                                    className={cn(
                                        "relative block aspect-square w-16 overflow-hidden rounded-control bg-surface-muted ring-offset-2 cursor-pointer",
                                        active === i ? "ring-2 ring-accent-ink" : "ring-1 ring-line hover:ring-line-strong"
                                    )}
                                >
                                    <Image src={image.url} alt="" fill sizes="64px" className="object-contain p-1" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                <button
                    type="button"
                    onClick={() => setZoom(active)}
                    aria-label="Open image full screen"
                    className="group relative aspect-square flex-1 overflow-hidden rounded-panel bg-surface-muted cursor-zoom-in"
                >
                    {main && <Image src={main} alt={name} fill sizes="(max-width: 1024px) 60vw, 560px" priority className="object-contain p-8" />}
                    <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-fg-muted opacity-0 shadow-card transition-opacity group-hover:opacity-100">
                        <MagnifyingGlassPlusIcon className="h-5 w-5" />
                    </span>
                </button>
            </div>

            <Lightbox images={images} index={zoom} onIndex={setZoom} onClose={() => setZoom(null)} label={name} />
        </div>
    );
};

export default Gallery;
