"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

import ApField from "./ApField";
import { ApAlert, ApButton, ApCard, ApPage } from "./ApShell";
import { OAuthRow } from "./AuthShell";
import DotLoaderSpinner from "@/components/loaders/dotLoader/DotLoaderSpinner";

const schema = z.object({
    email: z
        .string()
        .min(1, "Enter your email or mobile phone number")
        .email("Wrong or Invalid email address or mobile phone number. Please correct and try again."),
    password: z.string().min(1, "Enter your password"),
});

const SignInPage = ({ callbackUrl, activated, tokenError }: any) => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>(tokenError ? "Invalid or expired link." : "");
    const [showHelp, setShowHelp] = useState<boolean>(false);
    // Amazon asks for the address first and the password on a second screen.
    const [step, setStep] = useState<"email" | "password">("email");

    const methods = useForm({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

    const continueHandler = async () => {
        const valid = await methods.trigger("email");

        if (valid) {
            setError("");
            setStep("password");
        }
    };

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
        <ApPage>
            {loading && <DotLoaderSpinner loading={loading} />}

            <ApCard>
                <h1 className="text-[28px] leading-9 text-fg">Sign in</h1>

                {activated && (
                    <p className="text-[13px] text-success mt-2">
                        Your account is activated. You can sign in now.
                    </p>
                )}

                {error && <ApAlert>{error}</ApAlert>}

                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(submitHandler)}>
                        {step === "email" ? (
                            <>
                                <ApField name="email" label="Email or mobile phone number" autoComplete="email" />

                                <ApButton type="button" onClick={continueHandler}>
                                    Continue
                                </ApButton>
                            </>
                        ) : (
                            <>
                                <div className="flex items-baseline justify-between mt-3.5">
                                    <p className="text-[13px] text-fg">
                                        {methods.getValues("email")}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setStep("email")}
                                        className="text-[13px] text-accent-ink hover:underline hover:text-accent-deep cursor-pointer"
                                    >
                                        Change
                                    </button>
                                </div>

                                <div className="relative">
                                    <Link
                                        href="/auth/forgot"
                                        className="absolute right-0 top-0 text-[13px] text-accent-ink hover:underline hover:text-accent-deep"
                                    >
                                        Forgot password
                                    </Link>
                                    <ApField
                                        name="password"
                                        label="Password"
                                        type="password"
                                        autoComplete="current-password"
                                    />
                                </div>

                                <ApButton type="submit" disabled={loading}>
                                    {loading ? "Signing in…" : "Sign in"}
                                </ApButton>
                            </>
                        )}
                    </form>
                </FormProvider>

                <p className="text-[12px] text-fg mt-5">
                    By continuing, you agree to Markaz&apos;s{" "}
                    <Link href="/customer-service/security-privacy" className="text-accent-ink hover:underline hover:text-accent-deep">
                        Conditions of Use
                    </Link>{" "}
                    and{" "}
                    <Link href="/profile/data" className="text-accent-ink hover:underline hover:text-accent-deep">
                        Privacy Notice
                    </Link>
                    .
                </p>

                <div className="mt-3">
                    <button
                        onClick={() => setShowHelp(!showHelp)}
                        className="flex items-center text-[12px] text-accent-ink cursor-pointer"
                    >
                        <ChevronRightIcon
                            className={`h-3 mr-1 transition-transform ${showHelp ? "rotate-90" : ""}`}
                        />
                        Need help?
                    </button>

                    {showHelp && (
                        <ul className="text-[12px] text-accent-ink mt-2 ml-4 space-y-1">
                            <li>
                                <Link href="/auth/forgot" className="hover:underline hover:text-accent-deep">
                                    Forgot your password?
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/customer-service/managing-your-account"
                                    className="hover:underline hover:text-accent-deep"
                                >
                                    Other issues with Sign-In
                                </Link>
                            </li>
                        </ul>
                    )}
                </div>

                {/* Not on Amazon's own page; these providers are real here. */}
                <div className="mt-4">
                    <OAuthRow verb="Sign in" />
                </div>
            </ApCard>

            <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-300" />
                </div>
                <span className="relative bg-white px-3 text-[12px] text-fg-muted">New to Markaz?</span>
            </div>

            <Link
                href={`/auth/register${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
                className="block w-full text-center h-[31px] leading-[31px] text-[13px] rounded-lg border border-line-strong bg-linear-to-b from-surface-muted to-surface-muted text-fg hover:from-surface-muted hover:to-line"
            >
                Create your Markaz account
            </Link>
        </ApPage>
    );
};

export default SignInPage;
