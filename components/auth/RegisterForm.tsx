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
import { TextField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Layout";
import { emailSchema, passwordSchema } from "@/lib/authRules";
import { AuthHeading, Divider, OAuthButtons, PasswordChecklist, PasswordField } from "./AuthParts";

const schema = z.object({
    name: z.string().trim().min(2, "Enter your name.").max(50, "Keep your name under 50 characters."),
    email: emailSchema,
    password: passwordSchema,
});

// Three fields. The password rules tick themselves off as you type, and the
// show toggle replaces a "type it again" box. The account signs in straight
// away; the confirmation email can be dealt with later.
const RegisterForm = ({ email = "", callbackUrl = "", context = "" }: any) => {
    const router = useRouter();
    const [error, setError] = useState("");
    const [exists, setExists] = useState(false);
    const { register, handleSubmit, formState, control } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { name: "", email, password: "" },
    });
    const errors: any = formState.errors;
    const password = useWatch({ control, name: "password" });

    const submit = async (values: any) => {
        setError("");
        setExists(false);

        try {
            await axios.post("/api/auth/signup", values);
            await signIn("credentials", { redirect: false, email: values.email, password: values.password });
            router.push(callbackUrl || "/");
        } catch (err: any) {
            setExists(err.response?.data?.code === "exists");
            setError(err.response?.data?.message || "The account couldn't be created.");
        }
    };

    return (
        <>
            <AuthHeading
                title={context === "business" ? "Create a business account" : context === "seller" ? "Create a selling account" : "Create your account"}
                description="It takes a minute. You'll get an email to confirm the address."
            />

            <OAuthButtons callbackUrl={callbackUrl || "/"} />
            <Divider>or with your email</Divider>

            <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
                <TextField label="Your name" autoComplete="name" autoFocus error={errors.name?.message} {...register("name")} />
                <TextField
                    label={context === "business" ? "Work email" : "Email"}
                    type="email"
                    autoComplete="email"
                    error={errors.email?.message}
                    {...register("email")}
                />
                <div>
                    <PasswordField autoComplete="new-password" error={errors.password?.message} {...register("password")} />
                    <PasswordChecklist value={password} />
                </div>

                {error && (
                    <Notice tone="danger">
                        {error}{" "}
                        {exists && (
                            <Link href="/auth/signin" className="font-medium text-fg underline">
                                Sign in
                            </Link>
                        )}
                    </Notice>
                )}

                <Button type="submit" size="lg" block loading={formState.isSubmitting}>
                    Create account
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-fg-muted">
                Already have an account?{" "}
                <Link href={`/auth/signin${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`} className="font-medium text-link">
                    Sign in
                </Link>
            </p>
        </>
    );
};

export default RegisterForm;
