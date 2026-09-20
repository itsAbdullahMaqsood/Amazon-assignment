"use client";

import { useState } from "react";
import Image from "next/image";

const MainSwiper = ({ images, activeImg }: any) => {
    const [active, setActive] = useState<number>(0);

    return (
        <div className="flex flex-col md:col-span-3 md:flex-row-reverse px-2">
            <div className="relative">
                <Image
                    src={activeImg || images[active]?.url}
                    alt=""
                    width={400}
                    height={400}
                    className="object-cover"
                />
            </div>

            <div className="flex max-md:mt-2 md:mr-2 md:flex-col gap-2">
                {images.map((img: any, i: number) => (
                    <div
                        key={i}
                        onMouseOver={() => setActive(i)}
                        className={`w-10 cursor-pointer ${
                            active === i
                                ? "outline outline-1 outline-offset-2 outline-slate-600 rounded"
                                : ""
                        }`}
                    >
                        <Image
                            src={img.url}
                            alt=""
                            width={50}
                            height={50}
                            className="rounded object-cover"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MainSwiper;
