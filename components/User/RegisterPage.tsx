"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

import ApField from "./ApField";
import { ApAlert, ApButton, ApCard, ApPage } from "./ApShell";
import { OAuthRow } from "./AuthShell";
import DotLoaderSpinner from "@/components/loaders/dotLoader/DotLoaderSpinner";

const schema = z
    .object({
        name: z
            .string()
            .min(1, "Enter your name")
            .min(2, "Your name must be between 2 and 50 characters.")
            .max(50, "Your name must be between 2 and 50 characters."),
        email: z
            .string()
            .min(1, "Enter your email or mobile phone number")
            .email("Wrong or Invalid email address or mobile phone number. Please correct and try again."),
        password: z
            .string()
            .min(1, "Enter your password")
            .min(6, "Passwords must be at least 6 characters.")
            .max(36, "Password can not be more than 36 characters."),
        conf_password: z.string().min(1, "Type your password again"),
    })
    .refine((values) => values.password === values.conf_password, {
        message: "Passwords must match",
        path: ["conf_password"],
    });

const RegisterPage = ({ business, seller, email = "" }: any) => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    const methods = useForm({
        resolver: zodResolver(schema),
        defaultValues: { name: "", email, password: "", conf_password: "" },
    });

    const submitHandler = async (values: any) => {
        try {
            setLoading(true);
            setError("");

            const { data } = await axios.post("/api/auth/signup", {
                name: values.name,
                email: values.email,
                password: values.password,
            });

            setSuccess(data.message);

            setTimeout(async () => {
                await signIn("credentials", {
                    redirect: false,
                    email: values.email,
                    password: values.password,
                });
                router.push("/");
            }, 2000);
        } catch (err: any) {
            setSuccess("");
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ApPage>
            {loading && <DotLoaderSpinner loading={loading} />}

            <ApCard>
                <h1 className="text-[28px] leading-9 text-fg">
                    {business ? "Create a Business account" : seller ? "Create a Selling account" : "Create account"}
                </h1>

                {error && <ApAlert>{error}</ApAlert>}

                {success && (
                    <div className="border border-success bg-success-soft rounded p-3 mt-3">
                        <p className="text-[13px] text-fg">{success}</p>
                    </div>
                )}

                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(submitHandler)}>
                        <ApField name="name" label="Your name" autoComplete="name" />
                        <ApField
                            name="email"
                            label={business ? "Work email" : "Mobile number or email"}
                            autoComplete="email"
                        />
                        <ApField
                            name="password"
                            label="Password"
                            type="password"
                            autoComplete="new-password"
                        />

                        <p className="flex items-start gap-1 text-[12px] text-fg mt-1">
                            <InformationCircleIcon className="h-4 w-4 text-accent-ink shrink-0" />
                            Passwords must be at least 6 characters.
                        </p>

                        <ApField
                            name="conf_password"
                            label="Re-enter password"
                            type="password"
                            autoComplete="new-password"
                        />

                        <ApButton type="submit" disabled={loading}>
                            {loading ? "Creating account…" : "Continue"}
                        </ApButton>
                    </form>
                </FormProvider>

                <p className="text-[12px] text-fg mt-5">
                    By creating an account, you agree to Markaz&apos;s{" "}
                    <Link href="/customer-service/security-privacy" className="text-accent-ink hover:underline hover:text-accent-deep">
                        Conditions of Use
                    </Link>{" "}
                    and{" "}
                    <Link href="/profile/data" className="text-accent-ink hover:underline hover:text-accent-deep">
                        Privacy Notice
                    </Link>
                    .
                </p>

                <div className="h-px bg-surface-muted my-5" />

                {!business && (
                    <p className="text-[13px] text-fg">
                        Buying for work?{" "}
                        <Link href="/business" className="text-accent-ink hover:underline hover:text-accent-deep">
                            Create a free business account
                        </Link>
                    </p>
                )}

                <p className="text-[13px] text-fg mt-3">
                    Already have an account?{" "}
                    <Link href="/auth/signin" className="text-accent-ink hover:underline hover:text-accent-deep">
                        Sign in ›
                    </Link>
                </p>

                {/* Amazon has no social sign-in here; this build does, so it sits
                    below the divider rather than competing with the form. */}
                <div className="mt-4">
                    <OAuthRow verb="Sign up" />
                </div>
            </ApCard>
        </ApPage>
    );
};

export default RegisterPage;
