"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import Button from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Layout";
import { emailSchema } from "@/lib/authRules";
import { AuthHeading, Divider, OAuthButtons, PasswordField } from "./AuthParts";

const schema = z.object({ email: emailSchema, password: z.string().min(1, "Enter your password.") });

// Email and password on one screen: this store has one way to sign in with a
// password, so a second screen for it is only a second wait.
const SignInForm = ({ callbackUrl = "", activated = false, tokenError = false }: any) => {
    const router = useRouter();
    const [error, setError] = useState(tokenError ? "That confirmation link has expired. Sign in and we can send a new one." : "");
    const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });
    const errors: any = formState.errors;
    const destination = callbackUrl || "/";

    const submit = async (values: any) => {
        setError("");

        const res: any = await signIn("credentials", { redirect: false, email: values.email, password: values.password });

        if (res?.error) {
            // Auth.js v5 carries the authorize() message in `code`.
            setError(res.code || "That email and password don't match an account.");
            return;
        }

        router.push(destination);
    };

    return (
        <>
            <AuthHeading title="Sign in" description={callbackUrl === "/cart" ? "Then you can check out. Your cart stays as it is." : "Welcome back."} />

            {activated && (
                <Notice tone="success" className="mb-5">
                    Your email is confirmed. Sign in to start shopping.
                </Notice>
            )}

            <OAuthButtons callbackUrl={destination} />
            <Divider>or with your email</Divider>

            <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
                <TextField label="Email" type="email" autoComplete="email" autoFocus error={errors.email?.message} {...register("email")} />
                <PasswordField
                    autoComplete="current-password"
                    error={errors.password?.message}
                    action={
                        <Link href="/auth/forgot" className="text-link">
                            Forgot it?
                        </Link>
                    }
                    {...register("password")}
                />

                {error && <Notice tone="danger">{error}</Notice>}

                <Button type="submit" size="lg" block loading={formState.isSubmitting}>
                    Sign in
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-fg-muted">
                New to Markaz?{" "}
                <Link href={`/auth/register${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`} className="font-medium text-link">
                    Create an account
                </Link>
            </p>
        </>
    );
};

export default SignInForm;
