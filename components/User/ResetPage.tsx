"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";

import ApField from "./ApField";
import { ApAlert, ApButton, ApCard, ApPage } from "./ApShell";
import DotLoaderSpinner from "@/components/loaders/dotLoader/DotLoaderSpinner";

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
        <ApPage>
            {loading && <DotLoaderSpinner loading={loading} />}

            <ApCard>
                <h1 className="text-[28px] leading-9 text-fg">Create new password</h1>

                <p className="text-[13px] text-fg mt-2">
                    We&apos;ll ask for this password whenever you sign in.
                </p>

                {error && <ApAlert>{error}</ApAlert>}

                {success ? (
                    <div className="border border-success bg-success-soft rounded p-3 mt-4">
                        <p className="text-[13px] text-fg">{success}</p>
                    </div>
                ) : (
                    <FormProvider {...methods}>
                        <form onSubmit={methods.handleSubmit(submitHandler)}>
                            <ApField
                                name="new_password"
                                label="New password"
                                type="password"
                                autoComplete="new-password"
                                hint="Passwords must be at least 6 characters."
                            />
                            <ApField
                                name="conf_password"
                                label="Re-enter password"
                                type="password"
                                autoComplete="new-password"
                            />

                            <ApButton type="submit" disabled={loading}>
                                {loading ? "Saving…" : "Save changes and Sign-In"}
                            </ApButton>
                        </form>
                    </FormProvider>
                )}
            </ApCard>
        </ApPage>
    );
};

export default ResetPage;
