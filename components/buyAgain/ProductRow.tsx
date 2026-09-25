"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import StarRating from "@/components/shared/StarRating";
import Price from "@/components/shared/Price";
import AddToCartButton from "@/components/shared/AddToCartButton";

const PER_PAGE = 6;

const ProductRow = ({ title, products, delivery }: any) => {
    const trackRef = useRef<HTMLDivElement | null>(null);
    const [page, setPage] = useState<number>(0);

    if (!products?.length) {
        return null;
    }

    const pageCount = Math.max(1, Math.ceil(products.length / PER_PAGE));

    const move = (direction: number) => {
        const next = Math.min(Math.max(page + direction, 0), pageCount - 1);
        setPage(next);
        trackRef.current?.scrollTo({
            left: next * (trackRef.current?.clientWidth || 0),
            behavior: "smooth",
        });
    };

    const arrow =
        "w-10 h-12 shrink-0 border border-slate-300 rounded-lg bg-white flex items-center justify-center hover:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed cursor-pointer";

    return (
        <section className="mt-10">
            <div className="flex items-baseline justify-between">
                <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
                <span className="text-sm text-slate-600">
                    Page {page + 1} of {pageCount}
                </span>
            </div>

            <div className="flex items-start gap-3 mt-4">
                <button
                    onClick={() => move(-1)}
                    disabled={page === 0}
                    aria-label={`Scroll ${title} left`}
                    className={`${arrow} mt-20`}
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
                            className="w-[calc((100%-1rem*5)/6)] min-w-[190px] shrink-0"
                        >
                            <Link
                                href={`/product/${product.slug}?style=0`}
                                className="block bg-slate-100 rounded"
                            >
                                <div className="relative w-full h-[200px]">
                                    {product.image && (
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            sizes="200px"
                                            className="object-contain p-2"
                                        />
                                    )}
                                </div>
                            </Link>

                            <Link
                                href={`/product/${product.slug}?style=0`}
                                className="block mt-2 text-sm text-accent-ink hover:underline line-clamp-2"
                            >
                                {product.name}
                            </Link>

                            {product.attributes && (
                                <p className="text-xs text-slate-600 mt-1">{product.attributes}</p>
                            )}

                            {product.numberReviews > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                    <StarRating value={product.rating} size="w-4 h-4" />
                                    <span className="text-xs text-accent-ink">
                                        {product.numberReviews.toLocaleString()}
                                    </span>
                                </div>
                            )}

                            <div className="mt-1">
                                <Price
                                    value={product.price}
                                    listPrice={product.discount > 0 ? product.listPrice : null}
                                    discount={product.discount}
                                    size="md"
                                />
                            </div>

                            <p className="text-xs mt-1">
                                Delivery <span className="font-bold">{delivery}</span>
                            </p>

                            <AddToCartButton productId={product._id} />
                        </article>
                    ))}
                </div>

                <button
                    onClick={() => move(1)}
                    disabled={page >= pageCount - 1}
                    aria-label={`Scroll ${title} right`}
                    className={`${arrow} mt-20`}
                >
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </div>
        </section>
    );
};

export default ProductRow;
