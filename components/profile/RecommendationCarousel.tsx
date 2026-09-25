"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import StarRating from "@/components/shared/StarRating";
import Price from "@/components/shared/Price";

const PER_PAGE = 6;

const socialProof = (sold: number) => {
    if (sold >= 20000) return "20K+ viewed in past month";
    if (sold >= 1000) return `${Math.round(sold / 1000)}K+ viewed in past month`;
    if (sold >= 100) return `${Math.floor(sold / 100) * 100}+ viewed in past month`;
    return "";
};

const RecommendationCarousel = ({ title, products, delivery }: any) => {
    const [page, setPage] = useState<number>(0);
    const trackRef = useRef<HTMLDivElement | null>(null);
    const pageCount = Math.max(1, Math.ceil(products.length / PER_PAGE));

    if (!products.length) {
        return null;
    }

    const move = (direction: number) => {
        const next = Math.min(Math.max(page + direction, 0), pageCount - 1);
        setPage(next);
        trackRef.current?.scrollTo({
            left: next * (trackRef.current?.clientWidth || 0),
            behavior: "smooth",
        });
    };

    const arrow =
        "w-10 h-10 rounded-full border border-slate-300 bg-white flex items-center justify-center shrink-0 disabled:text-slate-300 disabled:cursor-not-allowed cursor-pointer";

    return (
        <section className="mt-10">
            <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-bold">{title}</h2>
                <span className="text-sm text-slate-600">
                    Page {page + 1} of {pageCount}
                </span>
            </div>

            <div className="flex items-center gap-2 mt-3">
                <button
                    onClick={() => move(-1)}
                    disabled={page === 0}
                    aria-label="Previous page"
                    className={arrow}
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>

                <div
                    ref={trackRef}
                    className="flex-1 flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
                >
                    {products.map((product: any) => (
                        <article
                            key={product._id}
                            className="w-[calc((100%-1.25rem*5)/6)] min-w-[160px] shrink-0"
                        >
                            <Link href={`/product/${product.slug}`} className="block">
                                <div className="relative w-full h-[220px]">
                                    {product.image && (
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            sizes="200px"
                                            className="object-contain"
                                        />
                                    )}
                                </div>
                            </Link>

                            <Link
                                href={`/product/${product.slug}`}
                                className="block mt-2 text-sm text-accent-ink hover:underline line-clamp-3"
                            >
                                {product.name}
                            </Link>

                            {product.numberReviews > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                    <StarRating value={product.rating} size="w-4 h-4" />
                                    <span className="text-xs text-accent-ink">
                                        {product.numberReviews.toLocaleString()}
                                    </span>
                                </div>
                            )}

                            {socialProof(product.sold) && (
                                <p className="text-xs text-slate-600 mt-0.5">
                                    {socialProof(product.sold)}
                                </p>
                            )}

                            {product.amazonChoice && (
                                <span className="inline-block bg-ink-800 text-white text-[11px] font-semibold px-2 py-0.5 rounded-sm mt-1">
                                    Markaz&apos;s Choice
                                </span>
                            )}

                            <div className="mt-1">
                                <Price
                                    value={product.price}
                                    discount={product.discount}
                                    size="md"
                                    className="text-black"
                                />
                            </div>

                            {product.limitedDeal && (
                                <span className="inline-block bg-danger text-white text-[11px] font-semibold px-2 py-0.5 rounded-sm mt-1">
                                    Limited time deal
                                </span>
                            )}

                            {product.discount > 0 && (
                                <p className="text-xs text-slate-600 mt-0.5">
                                    List:{" "}
                                    <span className="line-through">
                                        ${Number(product.listPrice).toFixed(2)}
                                    </span>
                                </p>
                            )}

                            <p className="text-xs mt-1">
                                Get it as soon as <span className="font-bold">{delivery}</span>
                            </p>

                            <p className="text-xs text-slate-600">
                                FREE Shipping on orders over $35 shipped by Markaz
                            </p>
                        </article>
                    ))}
                </div>

                <button
                    onClick={() => move(1)}
                    disabled={page >= pageCount - 1}
                    aria-label="Next page"
                    className={arrow}
                >
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </div>
        </section>
    );
};

export default RecommendationCarousel;
