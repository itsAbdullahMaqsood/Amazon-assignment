"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import ProductCard from "./productCard/ProductCard";

import "swiper/css";
import "swiper/css/navigation";

const HomeProductSwiper = ({ products, category }: any) => {
    const filtered = products.filter((product: any) => product.category?.name === category);

    if (!filtered.length) {
        return null;
    }

    return (
        <div className="bg-white rounded border border-gray-200 mb-4 mx-4 p-4">
            <h2 className="font-bold text-xl mb-3">{category}</h2>

            <Swiper
                modules={[Navigation]}
                navigation
                slidesPerView={1}
                slidesPerGroup={1}
                spaceBetween={10}
                breakpoints={{ 640: { slidesPerView: 5, slidesPerGroup: 2 } }}
                className="w-full products-swiper_home"
            >
                {filtered.map((product: any) => (
                    <SwiperSlide key={product._id}>
                        <ProductCard product={product} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default HomeProductSwiper;
