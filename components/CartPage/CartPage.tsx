"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAppDispatch } from "@/redux/hooks";
import { updateCart as updateCartAction } from "@/redux/slices/CartSlice";
import { showDialog } from "@/redux/slices/DialogSlice";
import { saveCart, updateCart } from "@/request/users";
import DotLoaderSpinner from "@/components/loaders/dotLoader/DotLoaderSpinner";
import CartHeader from "./CartHeader";
import Product from "./Product";
import Checkout from "./Checkout";
import PaymentMethods from "./PaymentMethods";

const CartPage = ({ cartItems }: any) => {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const [selected, setSelected] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Re-price the persisted cart against the database, so a stale localStorage
    // cart cannot carry yesterday's prices into checkout.
    useEffect(() => {
        const refreshCart = async () => {
            if (!cartItems.length) {
                return;
            }

            try {
                const data = await updateCart(cartItems);
                dispatch(updateCartAction(data));
            } catch {
                // Leave the persisted cart alone; the server re-prices again on save.
            }
        };

        refreshCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const shippingFee = Number(
        selected.reduce((acc: number, product: any) => acc + Number(product.shipping || 0), 0).toFixed(2)
    );
    const subTotal = Number(
        selected.reduce((acc: number, product: any) => acc + product.price * product.qty, 0).toFixed(2)
    );
    const total = Number((subTotal + shippingFee).toFixed(2));

    const continueHandler = async () => {
        try {
            setLoading(true);
            await saveCart(selected);
            router.push("/checkout");
        } catch (error: any) {
            setLoading(false);
            dispatch(
                showDialog({
                    header: "Cart Error",
                    msgs: [
                        {
                            msg: error.response?.data?.message || error.message,
                            type: "error",
                        },
                    ],
                })
            );
        }
    };

    return (
        <div className="flex flex-col md:flex-row px-2 py-8 md:px-8 gap-4">
            <div className="md:w-3/4">
                <CartHeader cartItems={cartItems} selected={selected} setSelected={setSelected} />

                <div className="bg-white rounded border border-gray-200 py-2 px-4">
                    <h1 className="font-bold text-3xl my-2">Shopping Cart</h1>

                    <div className="h-px w-full bg-slate-200" />

                    {cartItems.map((product: any) => (
                        <Product
                            key={product._uid}
                            product={product}
                            cartItems={cartItems}
                            selected={selected}
                            setSelected={setSelected}
                        />
                    ))}
                </div>
            </div>

            <div className="md:w-1/4">
                <Checkout
                    subtotal={subTotal}
                    shippingFee={shippingFee}
                    total={total}
                    selected={selected}
                    onContinue={continueHandler}
                />

                <PaymentMethods />
            </div>

            {loading && <DotLoaderSpinner loading={loading} />}
        </div>
    );
};

export default CartPage;
