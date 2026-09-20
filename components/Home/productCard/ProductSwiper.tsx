"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

const ProductSwiper = ({ images }: any) => {
    const swiperRef = useRef<any>(null);

    const startHandler = () => {
        swiperRef.current?.autoplay?.start();
    };

    const stopHandler = () => {
        swiperRef.current?.autoplay?.stop();
        swiperRef.current?.slideTo(0);
    };

    return (
        <div
            className="relative w-52"
            onMouseEnter={startHandler}
            onMouseLeave={stopHandler}
        >
            <Swiper
                modules={[Autoplay]}
                onSwiper={(swiper: any) => {
                    swiperRef.current = swiper;
                    swiper.autoplay?.stop();
                }}
                centeredSlides
                autoplay={{ delay: 100, stopOnLastSlide: false }}
                speed={500}
                slidesPerView={1}
            >
                {images.map((img: any, i: number) => (
                    <SwiperSlide key={i}>
                        <div className="flex items-center justify-center bg-white w-[220px] h-[300px]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={img.url}
                                alt=""
                                className="rounded object-cover w-full h-full"
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default ProductSwiper;
