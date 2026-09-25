"use client";

import Image from "next/image";

import { paymentMethods } from "@/lib/payments";

// Simulated payment: no gateway, no card fields, no real charge. The method was
// chosen at checkout, so it is shown locked rather than selectable.
const Payment = ({ order, onPay }: any) => {
    const method = paymentMethods.find((m) => m.id === order.paymentMethod);

    return (
        <div className="mt-6">
            <h2 className="text-xl font-semibold pb-2 mb-4 border-b-2 border-slate-200">Payment</h2>

            {method && (
                <div className="p-2 my-2 flex items-center rounded-xl bg-slate-200">
                    <input type="radio" checked readOnly disabled className="mr-2" />

                    <Image
                        src={`/assets/images/${method.id}.png`}
                        alt={method.name}
                        width={40}
                        height={40}
                        className="mr-2 object-contain"
                    />

                    <div>
                        <p className="font-semibold">{method.name}</p>
                        {method.description && (
                            <p className="text-sm text-slate-600">{method.description}</p>
                        )}
                    </div>
                </div>
            )}

            <button
                onClick={onPay}
                className="w-full mt-2 rounded-xl bg-ink-800 text-white p-4 font-semibold text-2xl hover:bg-ink-900 hover:scale-95 transition duration-300 cursor-pointer"
            >
                Pay
            </button>
        </div>
    );
};

export default Payment;
