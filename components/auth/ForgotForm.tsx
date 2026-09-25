"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

import Button from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Layout";
import { emailSchema } from "@/lib/authRules";
import { AuthHeading } from "./AuthParts";

const ForgotForm = () => {
    const [sent, setSent] = useState("");
    const [error, setError] = useState("");
    const { register, handleSubmit, formState, getValues } = useForm({
        resolver: zodResolver(z.object({ email: emailSchema })),
        defaultValues: { email: "" },
    });
    const errors: any = formState.errors;

    const submit = async (values: any) => {
        setError("");

        try {
            const { data } = await axios.post("/api/auth/forgot", values);
            setSent(data.message);
        } catch (err: any) {
            setError(err.response?.data?.message || "The link couldn't be sent. Try again.");
        }
    };

    if (sent) {
        return (
            <div className="text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
                    <EnvelopeIcon className="h-6 w-6" />
                </span>
                <AuthHeading title="Check your email" description={sent} />
                <p className="text-sm text-fg-muted">
                    Sent to {getValues("email")}.{" "}
                    <button type="button" onClick={() => setSent("")} className="text-link">
                        Use another email
                    </button>
                </p>
                <Button href="/auth/signin" variant="outline" block className="mt-6">
                    Back to sign in
                </Button>
            </div>
        );
    }

    return (
        <>
            <AuthHeading title="Reset your password" description="Enter the email you shop with and we'll send a link to choose a new password." />
            <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
                <TextField label="Email" type="email" autoComplete="email" autoFocus error={errors.email?.message} {...register("email")} />
                {error && <Notice tone="danger">{error}</Notice>}
                <Button type="submit" size="lg" block loading={formState.isSubmitting}>
                    Send reset link
                </Button>
            </form>
            <p className="mt-6 text-center text-sm text-fg-muted">
                Remembered it?{" "}
                <Link href="/auth/signin" className="font-medium text-link">
                    Sign in
                </Link>
            </p>
        </>
    );
};

export default ForgotForm;
