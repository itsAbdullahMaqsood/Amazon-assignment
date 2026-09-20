"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";

import LoginInput from "./LoginInput";
import ButtonInput from "./ButtonInput";
import DotLoaderSpinner from "@/components/loaders/dotLoader/DotLoaderSpinner";
import { AuthCard } from "./AuthShell";

const schema = z.object({
    email: z.string().min(1, "Email address is required.").email("Please enter a valid address"),
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
        <AuthCard>
            {loading && <DotLoaderSpinner loading={loading} />}

            <div className="bg-white border border-slate-300 rounded p-5 mt-4">
                <h1 className="text-xl font-bold">Forgot Password</h1>

                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(submitHandler)}>
                        <LoginInput name="email" type="text" icon="email" placeholder="Email address" />
                        <ButtonInput text="Send" />
                    </form>
                </FormProvider>

                {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
        </AuthCard>
    );
};

export default ForgotPage;
