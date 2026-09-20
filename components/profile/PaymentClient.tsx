"use client";

import { useState } from "react";
import axios from "axios";

import Payment from "@/components/checkoutPage/payment/Payment";

const PaymentClient = ({ defaultPaymentMethod }: any) => {
    const [paymentMethod, setPaymentMethod] = useState<string>(defaultPaymentMethod || "paypal");
    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<string>("");

    const saveHandler = async () => {
        try {
            setError("");
            const { data } = await axios.put("/api/user/changepm", { paymentMethod });
            setMessage(data.message);
        } catch (err: any) {
            setMessage("");
            setError(err.response?.data?.message || err.message);
        }
    };

    return (
        <div className="bg-white border border-slate-300 rounded-lg p-5">
            <Payment paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} profile />

            <button
                onClick={saveHandler}
                className="mt-4 px-8 py-2 rounded-full bg-linear-to-r from-amazon-orange to-yellow-300 text-amazon-blue_dark hover:text-slate-100 hover:from-amazon-blue_light hover:to-slate-300 transition duration-300 cursor-pointer"
            >
                Save as default
            </button>

            {message && <p className="text-green-600 text-sm mt-3">{message}</p>}
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>
    );
};

export default PaymentClient;
