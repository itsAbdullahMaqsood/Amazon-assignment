"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";

import ApField from "./ApField";
import { ApAlert, ApButton, ApCard, ApPage } from "./ApShell";
import DotLoaderSpinner from "@/components/loaders/dotLoader/DotLoaderSpinner";

const schema = z.object({
    email: z
        .string()
        .min(1, "Enter your email or mobile phone number")
        .email("Wrong or Invalid email address or mobile phone number. Please correct and try again."),
});

const ForgotPage = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    const methods = useForm({ resolver: zodResolver(schema), defaultValues: { email: "" } });

    const submitHandler = async (values: any) => {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const { data } = await axios.post("/api/auth/forgot", { email: values.email });
            setSuccess(data.message);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ApPage>
            {loading && <DotLoaderSpinner loading={loading} />}

            <ApCard>
                <h1 className="text-[28px] leading-9 text-[#0F1111]">Password assistance</h1>

                <p className="text-[13px] text-[#0F1111] mt-2">
                    Enter the email address associated with your Amazon account.
                </p>

                {error && <ApAlert>{error}</ApAlert>}

                {success ? (
                    <div className="border border-[#067D62] bg-[#f5fbf9] rounded p-3 mt-4">
                        <p className="text-[13px] text-[#0F1111]">{success}</p>
                    </div>
                ) : (
                    <FormProvider {...methods}>
                        <form onSubmit={methods.handleSubmit(submitHandler)}>
                            <ApField name="email" label="Email" autoComplete="email" />

                            <ApButton type="submit" disabled={loading}>
                                {loading ? "Sending…" : "Continue"}
                            </ApButton>
                        </form>
                    </FormProvider>
                )}

                <p className="text-[12px] text-[#0F1111] mt-5">
                    Has your email address changed? If you no longer use the address on your
                    account, sign in with it and update it under Login &amp; security.
                </p>
            </ApCard>
        </ApPage>
    );
};

export default ForgotPage;
