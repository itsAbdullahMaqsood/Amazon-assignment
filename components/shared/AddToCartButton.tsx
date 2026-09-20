"use client";

import { useState } from "react";
import axios from "axios";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addToCart, updateCart } from "@/redux/slices/CartSlice";

// Builds the same cart line the product page does: the API response plus qty,
// size and _uid.
const AddToCartButton = ({ productId, style = 0, size = 0 }: any) => {
    const dispatch = useAppDispatch();
    const cart = useAppSelector((state) => state.cart);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const clickHandler = async () => {
        try {
            setLoading(true);
            setError("");

            const { data } = await axios.get(`/api/product/${productId}?style=${style}&size=${size}`);

            if (data.quantity < 1) {
                setError("Out of stock");
                return;
            }

            const _uid = `${data._id}_${style}_${size}`;
            const existing = cart.cartItems.find((item: any) => item._uid === _uid);

            if (existing) {
                dispatch(
                    updateCart(
                        cart.cartItems.map((item: any) =>
                            item._uid === _uid ? { ...item, qty: item.qty + 1 } : item
                        )
                    )
                );
            } else {
                dispatch(addToCart({ ...data, qty: 1, size: data.size, _uid }));
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={clickHandler}
                disabled={loading}
                className="w-full mt-3 bg-[#FFD814] hover:bg-[#F7CA00] text-black text-sm rounded-full py-2 font-medium disabled:opacity-60 cursor-pointer"
            >
                {loading ? "Adding…" : "Add to cart"}
            </button>

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </>
    );
};

export default AddToCartButton;
