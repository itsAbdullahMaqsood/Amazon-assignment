"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";

import LoginInput from "./LoginInput";
import ButtonInput from "./ButtonInput";
import DotLoaderSpinner from "@/components/loaders/dotLoader/DotLoaderSpinner";
import { AuthCard, OAuthRow } from "./AuthShell";

const schema = z
    .object({
        name: z
            .string()
            .min(1, "What's your name?")
            .min(2, "First name must be between 2 and 16 characters.")
            .max(16, "First name must be between 2 and 16 characters.")
            .regex(/^[a-zA-Z\s]+$/, "Numbers and Special characters are not allowed"),
        email: z.string().min(1, "Email address is required.").email("Please enter a valid address"),
        password: z
            .string()
            .min(1, "Please enter a password.")
            .min(6, "Password must be atleast 6 characters.")
            .max(36, "Password can not be more than 36 characters."),
        conf_password: z.string().min(1, "Please confirm your password."),
    })
    .refine((values) => values.password === values.conf_password, {
        message: "Passwords must match.",
        path: ["conf_password"],
    });

const RegisterPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    const methods = useForm({
        resolver: zodResolver(schema),
        defaultValues: { name: "", email: "", password: "", conf_password: "" },
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
        <AuthCard>
            {loading && <DotLoaderSpinner loading={loading} />}

            <div className="bg-white border border-slate-300 rounded p-5 mt-4">
                <h1 className="text-xl font-bold">Sign up</h1>

                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(submitHandler)}>
                        <LoginInput name="name" type="text" icon="user" placeholder="Full Name" />
                        <LoginInput name="email" type="text" icon="email" placeholder="Email address" />
                        <LoginInput name="password" type="password" icon="password" placeholder="Password" />
                        <LoginInput
                            name="conf_password"
                            type="password"
                            icon="password"
                            placeholder="Re-type password"
                        />
                        <ButtonInput text="Sign up" />
                    </form>
                </FormProvider>

                {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <p className="text-xs mt-4">
                    By continuing, you agree to Amazon&apos;s Conditions of Use and Privacy Notice.
                </p>

                <OAuthRow verb="Sign up" />
            </div>

            <div className="auth-divider my-6 text-center text-xs text-slate-500">
                Already have an account?
            </div>

            <Link
                href="/auth/signin"
                className="button-orange block text-center w-full py-[0.5rem] text-sm text-gray-900"
            >
                Sign in to your account
            </Link>
        </AuthCard>
    );
};

export default RegisterPage;
