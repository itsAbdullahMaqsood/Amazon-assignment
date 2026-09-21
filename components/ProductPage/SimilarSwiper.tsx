"use client";

import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import StarRating from "@/components/shared/StarRating";
import Price from "@/components/shared/Price";

import "swiper/css";
import "swiper/css/navigation";

const SimilarSwiper = ({ products }: any) => {
    if (!products?.length) {
        return null;
    }

    return (
        <div>
            <h2 className="text-xl font-bold border-b border-slate-200 pb-2">
                Products related to this item
            </h2>

            <Swiper
                modules={[Navigation]}
                navigation
                slidesPerView={2}
                slidesPerGroup={2}
                spaceBetween={12}
                breakpoints={{ 640: { slidesPerView: 4, slidesPerGroup: 3 }, 1024: { slidesPerView: 6, slidesPerGroup: 4 } }}
                className="products-swiper py-3"
            >
                {products.map((product: any) => (
                    <SwiperSlide key={product._id}>
                        <Link href={`/product/${product.slug}`} className="group block">
                            <div className="relative w-full aspect-square bg-white">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 640px) 50vw, 180px"
                                    className="object-contain rounded"
                                />
                            </div>
                            <p className="text-sm text-[#007185] group-hover:text-[#C7511F] group-hover:underline line-clamp-2 mt-2">
                                {product.name}
                            </p>
                        </Link>

                        {product.numberReviews > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                                <StarRating value={product.rating} size="w-4 h-4" />
                                <span className="text-xs text-[#007185]">
                                    {product.numberReviews.toLocaleString()}
                                </span>
                            </div>
                        )}

                        <Price value={product.price} listPrice={product.listPrice} size="sm" className="mt-1" />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default SimilarSwiper;
