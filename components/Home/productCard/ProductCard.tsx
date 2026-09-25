"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import StarRating from "@/components/shared/StarRating";
import ProductSwiper from "./ProductSwiper";

const ProductCard = ({ product }: any) => {
    const [active, setActive] = useState<number>(0);

    const subProduct = product.subProducts[active];
    const images = subProduct.images;
    const prices = subProduct.sizes
        .map((size: any) => size.price)
        .sort((a: number, b: number) => a - b);
    const discount = subProduct.discount;

    const href = `/product/${product.slug}?style=${active}${
        subProduct.sizes.length > 1 ? `&size=${active}` : ""
    }`;

    // Amazon splits the price into a large integer and small cents.
    const priceParts = (value: number) => {
        const [whole, cents = "00"] = Number(value).toFixed(2).split(".");
        return { whole, cents };
    };

    const low = priceParts(prices[0]);
    const high = priceParts(prices[prices.length - 1]);
    const singlePrice = prices.length === 1 || prices[0] === prices[prices.length - 1];
    const sold = product.subProducts.reduce((acc: number, sub: any) => acc + (sub.sold || 0), 0);

    return (
        <div className="relative flex flex-col w-[215px] rounded p-1">
            <Link href={href}>
                <ProductSwiper images={images} alt={product.name} />
            </Link>

            {discount > 0 && (
                <span className="absolute top-0 -right-1 z-50 w-9 h-9 rounded-full bg-yellow-400 text-xs font-semibold flex items-center justify-center">
                    -{discount}%
                </span>
            )}

            <Link href={href} className="mt-2 text-sm hover:underline">
                {product.name.length > 45 ? `${product.name.slice(0, 45)}...` : product.name}
            </Link>

            {product.numberReviews > 0 && (
                <div className="flex items-center gap-1 mt-1">
                    <StarRating value={product.rating} size="w-4 h-4" />
                    <span className="text-xs text-accent-ink">({product.numberReviews})</span>
                </div>
            )}

            <span className="text-danger mt-1 flex items-baseline">
                <span className="text-xs mr-0.5">USD</span>
                <span className="text-lg font-medium leading-none">{low.whole}</span>
                <span className="text-xs">{low.cents}</span>
                {!singlePrice && (
                    <>
                        <span className="text-xs mx-1">-</span>
                        <span className="text-lg font-medium leading-none">{high.whole}</span>
                        <span className="text-xs">{high.cents}</span>
                    </>
                )}
                <span className="text-xs ml-0.5">$</span>
            </span>

            {sold > 0 && (
                <span className="text-xs text-slate-600 mt-0.5">{sold}+ bought in past month</span>
            )}

            {product.subProducts.length > 1 && (
                <span className="text-xs text-accent-ink mt-0.5">
                    +{product.subProducts.length - 1} other colour
                    {product.subProducts.length > 2 ? "s" : ""}
                </span>
            )}

            <div className="flex items-center gap-2 mt-2">
                {product.subProducts.map((sub: any, i: number) => (
                    <span
                        key={i}
                        onMouseOver={() => setActive(i)}
                        className={`cursor-pointer rounded-full hover:outline-1 hover:outline-offset-2 ${
                            active === i ? "outline outline-black outline-offset-2" : ""
                        }`}
                    >
                        {sub.color?.image ? (
                            <Image
                                src={sub.color.image}
                                alt=""
                                width={25}
                                height={25}
                                className="rounded-full object-cover"
                            />
                        ) : (
                            <span
                                className="block w-[25px] h-[25px] rounded-full"
                                style={{ backgroundColor: sub.color?.color }}
                            />
                        )}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default ProductCard;
