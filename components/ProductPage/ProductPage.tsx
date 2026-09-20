"use client";

import { useState } from "react";

import BreadCrumb from "./BreadCrumb";
import MainSwiper from "./MainSwiper";
import Infos from "./Infos";
import InfosShipping from "./InfosShipping";
import SimilarSwiper from "./SimilarSwiper";

const ProductPage = ({ product, similar }: any) => {
    const [activeImg, setActiveImg] = useState<string>("");

    return (
        <div className="w-full bg-white h-auto px-3 mb-6 md:px-2">
            <BreadCrumb category={product.category} subCategories={product.subCategories} />

            <div className="grid grid-row-8 md:grid-cols-8 gap-4">
                <MainSwiper images={product.images} activeImg={activeImg} />

                <Infos product={product} setActiveImg={setActiveImg} />

                <InfosShipping product={product} />
            </div>

            <div className="mt-2 mx-auto w-full md:w-4/5 p-2 border border-slate-200 rounded-lg">
                <SimilarSwiper products={similar} />
            </div>

            {/* Reviews section slots in here in a later prompt. */}
        </div>
    );
};

export default ProductPage;
