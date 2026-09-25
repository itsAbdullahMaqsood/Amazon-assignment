"use client";

import { useState } from "react";
import axios from "axios";
import { CheckCircleIcon } from "@heroicons/react/20/solid";

import { RadioCard } from "@/components/ui/Choice";
import { Notice } from "@/components/ui/Layout";
import { paymentMethods } from "@/lib/payments";

// Choosing a method saves it straight away: there is one setting on this card,
// so a Save button would only be a second click.
const PaymentSettings = ({ defaultPaymentMethod }: any) => {
    const [method, setMethod] = useState<string>(defaultPaymentMethod || "");
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    const choose = async (id: string) => {
        const previous = method;

        setMethod(id);
        setSaved(false);
        setError("");

        try {
            await axios.put("/api/user/changepm", { paymentMethod: id });
            setSaved(true);
        } catch (err: any) {
            setMethod(previous);
            setError(err.response?.data?.message || "That couldn't be saved.");
        }
    };

    return (
        <>
            <div className="grid gap-3">
                {paymentMethods.map((option) => (
                    <RadioCard
                        key={option.id}
                        name="defaultPayment"
                        value={option.id}
                        checked={method === option.id}
                        onChange={() => choose(option.id)}
                        label={option.name}
                        description={option.description}
                    />
                ))}
            </div>

            <div aria-live="polite" className="mt-3">
                {error ? (
                    <Notice tone="danger">{error}</Notice>
                ) : saved ? (
                    <p className="flex items-center gap-1.5 text-sm text-success">
                        <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
                        Saved. Checkout will start with this one.
                    </p>
                ) : null}
            </div>
        </>
    );
};

export default PaymentSettings;
