"use client";

import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import similarProducts from "./similarProducts";

import "swiper/css";
import "swiper/css/navigation";

const SimilarSwiper = () => {
    return (
        <div>
            <h3 className="font-semibold border-b border-slate-200 pb-1">Similar Product</h3>

            <Swiper
                modules={[Navigation]}
                navigation
                slidesPerView={4}
                slidesPerGroup={3}
                spaceBetween={1}
                breakpoints={{ 640: { slidesPerView: 5 } }}
                className="products-swiper py-3"
            >
                {similarProducts.map((img, i) => (
                    <SwiperSlide key={i}>
                        <Link href="/">
                            <Image src={img} alt="" width={150} height={150} />
                        </Link>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default SimilarSwiper;
