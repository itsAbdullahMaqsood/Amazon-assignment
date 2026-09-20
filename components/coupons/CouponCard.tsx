"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

import StarRating from "@/components/shared/StarRating";
import { compactCount, priceParts } from "@/lib/coupons";

const CouponCard = ({ product }: any) => {
    const href = `/product/${product.slug}?style=0`;
    const { whole, cents } = priceParts(product.listPrice);

    return (
        <article className="flex flex-col">
            <Link href={href} className="block relative h-[260px] bg-white">
                {product.image && (
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 260px"
                        className="object-contain p-2"
                    />
                )}
            </Link>

            {product.coupon > 0 && (
                <p className="mt-3 text-sm">
                    <span className="text-[#CC0C39] font-bold">
                        You pay ${product.youPay.toFixed(2)}
                    </span>{" "}
                    <span className="text-slate-800">with coupon</span>
                </p>
            )}

            <p className="flex items-start mt-1">
                <span className="text-xs mt-1">$</span>
                <span className="text-xl font-medium leading-none">{whole}</span>
                <span className="text-xs">{cents}</span>
            </p>

            <Link href={href} className="mt-1 text-sm hover:underline line-clamp-2">
                {product.name}
            </Link>

            {product.numberReviews > 0 && (
                <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm">{product.rating.toFixed(1)}</span>
                    <StarRating value={product.rating} size="w-4 h-4" />
                    <ChevronDownIcon className="w-3 h-3" />
                    <span className="text-sm text-[#0F5FA6]">
                        ({compactCount(product.numberReviews)})
                    </span>
                </div>
            )}

            {product.colors > 1 && (
                <Link href={href} className="mt-1 text-sm text-[#0F5FA6] hover:underline">
                    +{product.colors - 1} colors/patterns
                </Link>
            )}
        </article>
    );
};

export default CouponCard;
