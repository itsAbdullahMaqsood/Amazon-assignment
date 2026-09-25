"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import Button from "@/components/ui/Button";
import { Notice } from "@/components/ui/Layout";
import { passwordSchema } from "@/lib/authRules";
import { AuthHeading, PasswordChecklist, PasswordField } from "./AuthParts";

// Choosing the new password signs you straight in: there is nothing to gain
// from making someone type it again on the sign-in screen.
const ResetForm = ({ token }: any) => {
    const router = useRouter();
    const [error, setError] = useState("");
    const [expired, setExpired] = useState(false);
    const { register, handleSubmit, formState, control } = useForm({
        resolver: zodResolver(z.object({ password: passwordSchema })),
        defaultValues: { password: "" },
    });
    const errors: any = formState.errors;
    const password = useWatch({ control, name: "password" });

    const submit = async (values: any) => {
        setError("");

        try {
            const { data } = await axios.put("/api/auth/reset", { token, password: values.password });
            await signIn("credentials", { redirect: false, email: data.email, password: values.password });
            router.push("/profile");
        } catch (err: any) {
            setExpired(err.response?.data?.code === "expired");
            setError(err.response?.data?.message || "The password couldn't be changed.");
        }
    };

    return (
        <>
            <AuthHeading title="Choose a new password" description="You'll be signed in as soon as it's saved." />
            <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
                <div>
                    <PasswordField label="New password" autoComplete="new-password" autoFocus error={errors.password?.message} {...register("password")} />
                    <PasswordChecklist value={password} />
                </div>
                {error && (
                    <Notice tone="danger">
                        {error}{" "}
                        {expired && (
                            <Link href="/auth/forgot" className="font-medium text-fg underline">
                                Send a new link
                            </Link>
                        )}
                    </Notice>
                )}
                <Button type="submit" size="lg" block loading={formState.isSubmitting}>
                    Save and sign in
                </Button>
            </form>
        </>
    );
};

export default ResetForm;
