"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import "swiper/css";
import "swiper/css/navigation";

const slides = [
    "/assets/images/slider-1.jpg",
    "/assets/images/slider-2.jpg",
    "/assets/images/slider-3.jpg",
    "/assets/images/slider-4.jpg",
    "/assets/images/slider-5.jpg",
];

const arrowStyle = {
    top: "calc(30% - 15px)",
    color: "#404040",
    filter: "drop-shadow(1px 3px 1px rgb(255 255 255 / 0.8))",
};

const HeroCarousel = () => {
    return (
        <div className="relative w-full">
            <Swiper
                modules={[Autoplay, Navigation]}
                navigation={{ prevEl: ".hero-prev", nextEl: ".hero-next" }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop
                slidesPerView={1}
                className="w-full"
            >
                {slides.map((slide, i) => (
                    <SwiperSlide key={slide}>
                        <Image
                            src={slide}
                            alt=""
                            width={1500}
                            height={600}
                            priority={i === 0}
                            className="w-full object-cover"
                        />
                    </SwiperSlide>
                ))}
            </Swiper>

            <button
                className="hero-prev absolute z-20 w-[50px] h-[50px] cursor-pointer"
                style={{ ...arrowStyle, left: 15 }}
                aria-label="Previous slide"
            >
                <ChevronLeftIcon className="w-[50px] h-[50px]" />
            </button>

            <button
                className="hero-next absolute z-20 w-[50px] h-[50px] cursor-pointer"
                style={{ ...arrowStyle, right: 15 }}
                aria-label="Next slide"
            >
                <ChevronRightIcon className="w-[50px] h-[50px]" />
            </button>
        </div>
    );
};

export default HeroCarousel;
