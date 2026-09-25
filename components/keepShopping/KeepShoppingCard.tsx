"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

import StarRating from "@/components/shared/StarRating";
import Price from "@/components/shared/Price";
import AddToCartButton from "@/components/shared/AddToCartButton";
import Swatches from "./Swatches";

// A grid card. Sponsored placements trade the swatch rail for the colour count,
// the way the ad slots on Amazon's own grid do.
const KeepShoppingCard = ({ product, delivery, sponsored }: any) => {
    const [style, setStyle] = useState<number>(product.style || 0);

    const variant = product.styles?.[style] || product.styles?.[0] || product;
    const href = `/product/${product.slug}?style=${style}`;

    return (
        <article className="border border-slate-200 rounded-lg p-3 flex flex-col">
            <Link href={href} className={`block rounded ${sponsored ? "bg-surface-muted" : ""}`}>
                <div className="relative w-full h-[280px]">
                    {variant.image && (
                        <Image
                            src={variant.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 300px"
                            className="object-contain"
                        />
                    )}
                </div>
            </Link>

            <div className="mt-2 min-h-[32px]">
                {sponsored ? (
                    product.styles.length > 1 && (
                        <Link href={href} className="text-sm underline hover:text-accent-deep">
                            +{product.styles.length} colors/patterns
                        </Link>
                    )
                ) : (
                    <Swatches
                        styles={product.styles}
                        active={style}
                        onSelect={setStyle}
                        href={href}
                        size="w-6 h-6"
                    />
                )}
            </div>

            {sponsored && (
                <p className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                    Sponsored
                    <InformationCircleIcon className="w-4 h-4" />
                </p>
            )}

            {product.brand && <p className="uppercase font-bold text-sm mt-1">{product.brand}</p>}

            <Link href={href} className="text-sm mt-0.5 hover:text-accent-deep hover:underline line-clamp-2">
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

            {product.bought && <p className="text-xs text-slate-600 mt-0.5">{product.bought}</p>}

            {variant.discount > 0 && (
                <span className="inline-block self-start bg-danger text-white text-[11px] font-semibold px-2 py-0.5 rounded-sm mt-1">
                    Limited time deal
                </span>
            )}

            <div className="mt-1">
                <Price value={variant.price} discount={variant.discount} size="md" />
            </div>

            {variant.discount > 0 && (
                <p className="text-xs text-slate-600 mt-0.5">
                    Typical price:{" "}
                    <span className="line-through">${Number(variant.listPrice).toFixed(2)}</span>
                </p>
            )}

            <p className="text-xs mt-1">
                FREE delivery <span className="font-bold">{delivery}</span>
            </p>

            <div className="mt-auto">
                <AddToCartButton productId={product._id} style={style} />
            </div>
        </article>
    );
};

export default KeepShoppingCard;
