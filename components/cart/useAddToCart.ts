"use client";

import { useState } from "react";
import axios from "axios";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addToCart, updateCart } from "@/redux/slices/CartSlice";
import { pushToast } from "@/redux/slices/ToastSlice";

// Adds one variant to the cart from anywhere (product page, cards, Shabana,
// buy again) and confirms it with a toast that offers the next step. The line
// is built from /api/product, so price and stock come from the database, and
// the quantity never goes past what is in stock.
const useAddToCart = () => {
    const dispatch = useAppDispatch();
    const cartItems = useAppSelector((state) => state.cart.cartItems);
    const [pending, setPending] = useState<string>("");

    const add = async ({ productId, style = 0, size, qty = 1, silent = false }: any) => {
        const key = `${productId}_${style}_${size ?? ""}`;
        setPending(key);

        try {
            const query = size === undefined || size === null ? "" : `&size=${size}`;
            const { data } = await axios.get(`/api/product/${productId}?style=${style}${query}`);

            if (data.quantity < 1) {
                dispatch(pushToast({ title: "Out of stock", body: `${data.name} sold out in that option.`, tone: "danger" }));
                return false;
            }

            const _uid = `${data._id}_${style}_${data.sizeIndex}`;
            const existing = cartItems.find((item: any) => item._uid === _uid);
            const wanted = (existing?.qty || 0) + qty;
            const finalQty = Math.min(wanted, data.quantity);

            if (existing) {
                dispatch(updateCart(cartItems.map((item: any) => (item._uid === _uid ? { ...item, qty: finalQty } : item))));
            } else {
                dispatch(addToCart({ ...data, qty: finalQty, size: data.size, _uid }));
            }

            if (!silent) {
                dispatch(
                    pushToast({
                        title: finalQty < wanted ? `Only ${data.quantity} in stock` : "Added to your cart",
                        body: finalQty < wanted ? `Your cart now holds all ${data.quantity}.` : data.name,
                        image: data.images?.[0]?.url,
                        secondary: { label: "View cart", href: "/cart" },
                        action: { label: "Check out", href: "/checkout" },
                    })
                );
            }

            return true;
        } catch (error: any) {
            dispatch(
                pushToast({
                    title: "Couldn't add that",
                    body: error.response?.data?.message || "The product may no longer be available.",
                    tone: "danger",
                })
            );
            return false;
        } finally {
            setPending("");
        }
    };

    return { add, pending, isPending: (productId: string) => pending.startsWith(`${productId}_`) };
};

export default useAddToCart;
