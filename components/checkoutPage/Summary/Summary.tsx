"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import ShippingInput from "../ShippingInput";

const schema = z.object({
    coupon: z
        .string()
        .min(1, "Please enter a coupon first!")
        .min(3, "Coupon code must Between 3 and 10 character")
        .max(10, "Coupon code must Between 3 and 10 character"),
});

const Summary = ({
    cart,
    paymentMethod,
    selectedAddress,
    totalAfterDiscount,
    setTotalAfterDiscount,
    setLoading,
}: any) => {
    const router = useRouter();

    const [discount, setDiscount] = useState<number>(0);
    const [couponError, setCouponError] = useState<string>("");
    const [orderError, setOrderError] = useState<string>("");

    const methods = useForm({ resolver: zodResolver(schema), defaultValues: { coupon: "" } });

    const applyHandler = async (values: any) => {
        try {
            setCouponError("");

            const { data } = await axios.post("/api/user/applycoupon", { coupon: values.coupon });

            setTotalAfterDiscount(data.totalAfterDiscount);
            setDiscount(data.discount);
        } catch (error: any) {
            setCouponError(error.response?.data?.message || error.message);
            setTotalAfterDiscount("");
            setDiscount(0);
        }
    };

    const placeOrderHandler = async () => {
        if (!paymentMethod) {
            setOrderError("please choose a payment method.");
            return;
        }

        if (!selectedAddress) {
            setOrderError("please choose a shipping address.");
            return;
        }

        try {
            setOrderError("");
            setLoading(true);

            const { data } = await axios.post("/api/order/create", {
                shippingAddress: selectedAddress,
                paymentMethod,
                couponApplied: methods.getValues("coupon"),
            });

            router.push(`/order/${data.order_id}`);
        } catch (error: any) {
            setLoading(false);
            setOrderError(error.response?.data?.message || error.message);
        }
    };

    return (
        <div className="mt-8">
            <h2 className="text-xl font-semibold pb-2 mb-4 border-b-2 border-slate-200">
                Order Summary
            </h2>

            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(applyHandler)}>
                    <ShippingInput name="coupon" placeholder="*Coupon" />

                    <button
                        type="submit"
                        className="bg-linear-to-r from-amazon-blue_light to-slate-500 text-slate-100 hover:from-amazon-orange hover:to-yellow-300 hover:text-amazon-blue_dark rounded-full w-full my-6 p-2 transition duration-300 cursor-pointer"
                    >
                        Apply
                    </button>
                </form>
            </FormProvider>

            {couponError && <p className="text-red-500 text-sm mb-2">{couponError}</p>}

            <p className="font-bold">Total: {cart.cartTotal}$</p>

            {discount > 0 && (
                <p className="bg-green-600 text-white rounded-xl px-3 py-1 my-2 w-fit text-sm">
                    Coupon applied: -{discount}%
                </p>
            )}

            {totalAfterDiscount !== "" && Number(totalAfterDiscount) < cart.cartTotal && (
                <p className="font-bold">New Price: {totalAfterDiscount}$</p>
            )}

            <button
                onClick={placeOrderHandler}
                className="w-full p-4 my-4 rounded-full bg-linear-to-r from-amazon-orange to-yellow-300 text-amazon-blue_dark hover:text-slate-100 hover:from-amazon-blue_light hover:to-slate-400 transition duration-300 cursor-pointer"
            >
                Place Order
            </button>

            {orderError && <p className="text-red-500 text-sm">{orderError}</p>}
        </div>
    );
};

export default Summary;
