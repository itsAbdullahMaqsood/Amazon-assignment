"use client";

import Image from "next/image";

import { paymentMethods } from "./paymentMethods";

const Payment = ({ paymentMethod, setPaymentMethod, profile }: any) => {
    return (
        <div>
            {!profile && (
                <h2 className="text-xl font-semibold pb-2 mb-4 border-b-2 border-slate-200">
                    Payment Method
                </h2>
            )}

            {paymentMethods.map((method) => (
                <div
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`cursor-pointer p-2 my-2 flex items-center rounded-xl hover:bg-slate-200 transition ${
                        paymentMethod === method.id ? "bg-slate-200" : ""
                    }`}
                >
                    <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        className="mr-2 cursor-pointer"
                    />

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
            ))}
        </div>
    );
};

export default Payment;
