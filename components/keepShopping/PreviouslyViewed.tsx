"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import StarRating from "@/components/shared/StarRating";
import Price from "@/components/shared/Price";
import Swatches from "./Swatches";

// The last listing the shopper opened, rebuilt at detail-page size. Picking a
// swatch repaints the image and the price from data already on the client.
const PreviouslyViewed = ({ product, delivery }: any) => {
    const [style, setStyle] = useState<number>(product.style || 0);

    const variant = product.styles?.[style] || product.styles?.[0] || product;
    const href = `/product/${product.slug}?style=${style}`;

    return (
        <section className="py-6">
            <h2 className="text-2xl font-bold">Previously viewed</h2>

            <div className="flex flex-col md:flex-row gap-6 md:gap-10 mt-4">
                <Link href={href} className="shrink-0">
                    <div className="relative w-full md:w-[430px] h-[380px] md:h-[560px]">
                        {variant.image && (
                            <Image
                                src={variant.image}
                                alt={product.name}
                                fill
                                priority
                                sizes="(max-width: 768px) 100vw, 430px"
                                className="object-contain"
                            />
                        )}
                    </div>
                </Link>

                <div className="max-w-[640px]">
                    <Swatches
                        styles={product.styles}
                        active={style}
                        onSelect={setStyle}
                        href={href}
                    />

                    {product.brand && (
                        <p className="uppercase font-bold mt-4">{product.brand}</p>
                    )}

                    <Link href={href} className="block text-xl mt-1 hover:text-[#C7511F] hover:underline">
                        {product.name}
                    </Link>

                    {product.numberReviews > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                            <StarRating value={product.rating} size="w-4 h-4" />
                            <span className="text-sm text-[#0F5FA6]">
                                {product.numberReviews.toLocaleString()}
                            </span>
                        </div>
                    )}

                    {product.bought && (
                        <p className="text-sm text-slate-600 mt-1">{product.bought}</p>
                    )}

                    {variant.discount > 0 && (
                        <span className="inline-block bg-[#CC0C39] text-white text-xs font-semibold px-2 py-1 rounded-sm mt-3">
                            Limited time deal
                        </span>
                    )}

                    <div className="mt-2">
                        <Price value={variant.price} discount={variant.discount} size="lg" />
                    </div>

                    {variant.discount > 0 && (
                        <p className="text-xs text-slate-600 mt-1">
                            Typical price:{" "}
                            <span className="line-through">
                                ${Number(variant.listPrice).toFixed(2)}
                            </span>
                        </p>
                    )}

                    <p className="text-sm mt-2">
                        FREE delivery <span className="font-bold">{delivery}</span> on $35 of items
                        shipped by Amazon
                    </p>

                    <Link
                        href={href}
                        className="inline-block mt-5 px-10 py-2 rounded-full border border-slate-400 text-sm hover:bg-slate-50"
                    >
                        Buying options
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default PreviouslyViewed;
