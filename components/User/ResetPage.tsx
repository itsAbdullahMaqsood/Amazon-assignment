"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";

import LoginInput from "./LoginInput";
import ButtonInput from "./ButtonInput";
import DotLoaderSpinner from "@/components/loaders/dotLoader/DotLoaderSpinner";
import { AuthCard } from "./AuthShell";

const schema = z
    .object({
        new_password: z
            .string()
            .min(1, "Please enter a password.")
            .min(6, "Password must be atleast 6 characters.")
            .max(36, "Password can not be more than 36 characters."),
        conf_password: z.string().min(1, "Please confirm your password."),
    })
    .refine((values) => values.new_password === values.conf_password, {
        message: "Passwords must match.",
        path: ["conf_password"],
    });

const ResetPage = ({ token }: any) => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    const methods = useForm({
        resolver: zodResolver(schema),
        defaultValues: { new_password: "", conf_password: "" },
    });

    const submitHandler = async (values: any) => {
        try {
            setLoading(true);
            setError("");

            const { data } = await axios.put("/api/auth/reset", {
                token,
                password: values.new_password,
            });

            setSuccess(data.message);
            setTimeout(() => router.push("/auth/signin"), 2000);
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
                <h1 className="text-xl font-bold">Reset Password</h1>

                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(submitHandler)}>
                        <LoginInput
                            name="new_password"
                            type="password"
                            icon="password"
                            placeholder="New password"
                        />
                        <LoginInput
                            name="conf_password"
                            type="password"
                            icon="password"
                            placeholder="Re-type new password"
                        />
                        <ButtonInput text="Reset" />
                    </form>
                </FormProvider>

                {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
        </AuthCard>
    );
};

export default ResetPage;
