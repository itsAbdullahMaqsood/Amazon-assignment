"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

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

    return (
        <div className="relative flex flex-col w-[215px] rounded p-1">
            <Link href={href}>
                <ProductSwiper images={images} />
            </Link>

            {discount > 0 && (
                <span className="absolute top-0 -right-1 z-50 w-9 h-9 rounded-full bg-yellow-400 text-xs font-semibold flex items-center justify-center">
                    -{discount}%
                </span>
            )}

            <Link href={href} className="mt-2 text-sm hover:underline">
                {product.name.length > 45 ? `${product.name.slice(0, 45)}...` : product.name}
            </Link>

            <span className="text-xs text-red-500 mt-1">
                {prices.length === 1 || prices[0] === prices[prices.length - 1]
                    ? `USD${prices[0]}$`
                    : `USD${prices[0]} - ${prices[prices.length - 1]}$`}
            </span>

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
