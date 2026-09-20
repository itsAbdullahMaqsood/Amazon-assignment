"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import {
    ArrowPathIcon,
    HeartIcon,
    MinusIcon,
    PlusIcon,
    ShoppingBagIcon,
} from "@heroicons/react/24/solid";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addToCart, updateCart } from "@/redux/slices/CartSlice";
import { showDialog } from "@/redux/slices/DialogSlice";
import StarRating from "@/components/shared/StarRating";
import Accordion from "@/components/shared/Accordion";

const Infos = ({ product, setActiveImg }: any) => {
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const cart = useAppSelector((state) => state.cart);
    const { data: session }: any = useSession();

    const styleParam = searchParams.get("style");
    const sizeParam = searchParams.get("size");

    const [loading, setLoading] = useState<boolean>(false);
    const [qty, setQty] = useState<number>(1);
    const [error, setError] = useState<string>("");
    const [tracked, setTracked] = useState({ style: styleParam, size: sizeParam });

    // Adjusting state while rendering rather than in an effect: picking another
    // color resets the quantity (and drops the size from the URL), while picking
    // another size only clamps the quantity to what that size has in stock.
    if (tracked.style !== styleParam || tracked.size !== sizeParam) {
        setTracked({ style: styleParam, size: sizeParam });

        if (tracked.style !== styleParam) {
            setQty(1);
        } else if (qty > product.quantity) {
            setQty(product.quantity);
        }
    }

    const addToCartHandler = async () => {
        if (!sizeParam) {
            setError("Please Select a size");
            return;
        }

        setLoading(true);

        const { data } = await axios.get(
            `/api/product/${product._id}?style=${product.style}&size=${sizeParam}`
        );

        if (qty > data.quantity) {
            setError("the Quantity you have choosed is more than in stock. Try lower the Qty");
        } else if (data.quantity < 1) {
            setError("this Product is out of stock!");
        } else {
            const _uid = `${product._id}_${product.style}_${sizeParam}`;
            const existing = cart.cartItems.find((item: any) => item._uid === _uid);

            if (existing) {
                const updated = cart.cartItems.map((item: any) =>
                    item._uid === existing._uid ? { ...item, qty } : item
                );
                dispatch(updateCart(updated));
            } else {
                dispatch(addToCart({ ...data, qty, size: data.size, _uid }));
            }

            setError("");
        }

        setLoading(false);
    };

    const addToWishListHandler = async () => {
        if (!session) {
            signIn();
            return;
        }

        try {
            const { data } = await axios.put("/api/user/wishlist", {
                product_id: product._id,
                style: product.style,
            });

            dispatch(
                showDialog({
                    header: "Product added to WishList successfully",
                    msgs: [{ msg: data.message, type: "success" }],
                })
            );
        } catch (err: any) {
            dispatch(
                showDialog({
                    header: "WishList Error",
                    msgs: [{ msg: err.response?.data?.message || err.message, type: "error" }],
                })
            );
        }
    };

    const availableQty = sizeParam
        ? product.quantity
        : product.sizes.reduce((acc: number, s: any) => acc + s.qty, 0);

    return (
        <div className="flex flex-col row-span-3 md:col-span-3 max-md:px-2 mb-4">
            <h1 className="text-2xl font-bold">{product.name}</h1>

            <div className="flex items-center gap-2 mt-1">
                <span className="uppercase text-sm text-slate-600 hover:underline cursor-pointer">
                    {product.brand}
                </span>
                <StarRating value={product.rating} />
                <span className="text-slate-500 text-sm">({product.numReviews} reviews)</span>
            </div>

            <div className="h-px w-full bg-slate-200 my-3" />

            <div className="flex items-center gap-3">
                <span className="text-4xl font-semibold text-red-500">
                    {sizeParam ? `${product.price}$` : product.priceRange}
                </span>

                {product.discount > 0 && (
                    <>
                        {sizeParam && (
                            <span className="text-xl line-through text-slate-400">
                                {product.priceBefore}$
                            </span>
                        )}
                        <span className="text-blue-500">(-{product.discount}%)</span>
                    </>
                )}
            </div>

            <span className="text-sm text-slate-500 mt-1">{availableQty} pieces Available</span>

            <p className="text-sm my-4">{product.description}</p>

            <div className="mt-2">
                <h4 className="font-semibold mb-2">Select a Size:</h4>
                <div className="flex flex-wrap gap-3">
                    {product.sizes.map((s: any, i: number) => (
                        <Link
                            key={i}
                            href={`/product/${product.slug}?style=${product.style}&size=${i}`}
                            className={`w-11 h-11 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center hover:outline hover:outline-1 hover:outline-slate-400 hover:outline-offset-[3px] ${
                                Number(sizeParam) === i
                                    ? "font-semibold bg-linear-to-r from-amazon-orange to-slate-100"
                                    : ""
                            }`}
                        >
                            {s.size}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="mt-4">
                <h4 className="font-semibold mb-2">Select a Color:</h4>
                <div className="flex flex-wrap gap-3">
                    {product.colors.map((color: any, i: number) => (
                        <Link
                            key={i}
                            href={`/product/${product.slug}?style=${i}`}
                            onMouseOver={() =>
                                setActiveImg(product.subProducts[i].images[0].url)
                            }
                            onMouseLeave={() => setActiveImg("")}
                            className={`w-11 h-11 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden hover:outline hover:outline-1 hover:outline-slate-400 hover:outline-offset-[3px] ${
                                product.style === i ? "outline outline-1 outline-slate-600" : ""
                            }`}
                        >
                            {color.image ? (
                                <Image
                                    src={color.image}
                                    alt=""
                                    width={44}
                                    height={44}
                                    className="rounded-full object-cover"
                                />
                            ) : (
                                <span
                                    className="w-full h-full rounded-full"
                                    style={{ backgroundColor: color.color }}
                                />
                            )}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-3 mt-5">
                <button
                    onClick={() => qty > 1 && setQty(qty - 1)}
                    className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center cursor-pointer"
                >
                    <MinusIcon className="w-4 h-4" />
                </button>

                <span className="font-semibold">{qty}</span>

                <button
                    onClick={() => qty < product.quantity && setQty(qty + 1)}
                    className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center cursor-pointer"
                >
                    <PlusIcon className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center gap-3 mt-5">
                <button
                    onClick={addToCartHandler}
                    disabled={product.quantity < 1}
                    className={`grow flex items-center justify-center gap-2 rounded-full p-2 bg-linear-to-r from-amazon-orange to-yellow-300 text-amazon-blue_dark hover:from-amazon-blue_light hover:to-slate-500 hover:text-slate-100 hover:shadow-lg transition duration-300 ${
                        product.quantity < 1 ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                >
                    {loading ? (
                        <>
                            <ArrowPathIcon className="w-8 h-8 animate-spin" />
                            <span className="font-semibold text-xl">Loading...</span>
                        </>
                    ) : (
                        <>
                            <ShoppingBagIcon className="w-8 h-8" />
                            <span className="font-semibold text-xl">ADD TO CART</span>
                        </>
                    )}
                </button>

                <button
                    onClick={addToWishListHandler}
                    className="flex items-center gap-1 rounded bg-slate-200 text-amazon-blue_light p-2 hover:bg-amazon-blue_light hover:text-slate-100 transition duration-300 cursor-pointer"
                >
                    <HeartIcon className="w-8 h-8" />
                    <span>WishList</span>
                </button>
            </div>

            {error && <span className="text-red-500 font-semibold mt-3">{error}</span>}

            <div className="mt-5">
                <Accordion
                    items={[
                        {
                            title: "Details",
                            content: (
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {product.details?.map((detail: any, i: number) => (
                                        <div key={i} className="contents">
                                            <span className="font-semibold">{detail.name}</span>
                                            <span>{detail.value}</span>
                                        </div>
                                    ))}
                                </div>
                            ),
                        },
                        {
                            title: "Questions",
                            content: (
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {product.questions?.map((question: any, i: number) => (
                                        <div key={i} className="contents">
                                            <span className="font-semibold">{question.question}</span>
                                            <span>{question.answer}</span>
                                        </div>
                                    ))}
                                </div>
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    );
};

export default Infos;
