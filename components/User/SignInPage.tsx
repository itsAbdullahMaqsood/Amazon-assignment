"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

import LoginInput from "./LoginInput";
import ButtonInput from "./ButtonInput";
import DotLoaderSpinner from "@/components/loaders/dotLoader/DotLoaderSpinner";
import { AuthCard, OAuthRow } from "./AuthShell";

const schema = z.object({
    email: z
        .string()
        .min(1, "Email address is required.")
        .email("Please enter a valid address"),
    password: z.string().min(1, "Please enter a password."),
});

const SignInPage = ({ callbackUrl, activated, tokenError }: any) => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>(tokenError ? "Invalid or expired link." : "");
    const [showHelp, setShowHelp] = useState<boolean>(false);

    const methods = useForm({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

    const submitHandler = async (values: any) => {
        setLoading(true);
        setError("");

        const res: any = await signIn("credentials", {
            redirect: false,
            email: values.email,
            password: values.password,
        });

        setLoading(false);

        if (res?.error) {
            // v5 puts the authorize() message in `code`; `error` is the generic type.
            setError(res.code || "Invalid email or password.");
            return;
        }

        // No router.refresh() here: it re-renders /auth/signin and cancels the
        // in-flight push. The push itself fetches a fresh payload with the cookie.
        router.push(callbackUrl || "/");
    };

    return (
        <AuthCard>
            {loading && <DotLoaderSpinner loading={loading} />}

            <div className="bg-white border border-slate-300 rounded p-5 mt-4">
                <h1 className="text-xl font-bold">Sign in</h1>

                {activated && (
                    <p className="text-green-600 text-sm mt-2">
                        Your account is activated. You can sign in now.
                    </p>
                )}

                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(submitHandler)}>
                        <LoginInput name="email" type="text" icon="email" placeholder="Email address" />
                        <LoginInput name="password" type="password" icon="password" placeholder="Password" />
                        <ButtonInput text="Sign in" />
                    </form>
                </FormProvider>

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <p className="text-xs mt-4">
                    By continuing, you agree to Amazon&apos;s Conditions of Use and Privacy Notice.
                </p>

                <div className="mt-3">
                    <button
                        onClick={() => setShowHelp(!showHelp)}
                        className="flex items-center text-xs cursor-pointer"
                    >
                        <ChevronRightIcon
                            className={`h-3 mr-1 transition-transform ${showHelp ? "rotate-90" : ""}`}
                        />
                        Need help?
                    </button>

                    {showHelp && (
                        <ul className="text-xs text-blue-600 mt-2 ml-4 space-y-1">
                            <li>
                                <Link href="/auth/forgot" className="hover:underline">
                                    Forgot your password?
                                </Link>
                            </li>
                            <li className="cursor-pointer hover:underline">Other issues with Sign-In</li>
                        </ul>
                    )}
                </div>

                <OAuthRow verb="Sign in" />
            </div>

            <div className="auth-divider my-6 text-center text-xs text-slate-500">
                New to Amazon?
            </div>

            <Link
                href="/auth/register"
                className="button-orange block text-center w-full py-[0.5rem] text-sm text-gray-900"
            >
                Create your Amazon account
            </Link>
        </AuthCard>
    );
};

export default SignInPage;
