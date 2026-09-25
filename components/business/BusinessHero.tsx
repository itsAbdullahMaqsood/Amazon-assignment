"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
    email: z
        .string()
        .min(1, "Enter your work email address.")
        .email("Enter a valid email address."),
});

// The capture only carries the address across to sign-up; the account itself is
// created by the existing register form.
const BusinessHero = () => {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: zodResolver(schema), defaultValues: { email: "" } });

    const submitHandler = (values: any) => {
        router.push(`/auth/register?business=1&email=${encodeURIComponent(values.email)}`);
    };

    return (
        <section className="bg-ink-800 text-white">
            <div className="max-w-[1500px] mx-auto px-4 py-10 md:py-16 grid gap-10 lg:grid-cols-[1.1fr_1fr] items-center">
                <div>
                    <p className="text-accent font-semibold tracking-wide text-sm">
                        MARKAZ BUSINESS
                    </p>
                    <h1 className="text-3xl md:text-5xl font-bold mt-2 leading-tight">
                        Everything you love about Markaz. For work.
                    </h1>
                    <p className="mt-4 text-white/85 md:text-lg max-w-xl">
                        Business pricing, multi-user accounts, approvals and spend reporting — on an
                        account that costs nothing to open.
                    </p>

                    <form onSubmit={handleSubmit(submitHandler)} className="mt-6 max-w-lg">
                        <label htmlFor="business-email" className="block text-sm font-semibold mb-1">
                            Work email address
                        </label>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                id="business-email"
                                type="email"
                                placeholder="name@company.com"
                                autoComplete="email"
                                {...register("email")}
                                className="grow text-sm text-slate-900 bg-white p-2.5 rounded border border-slate-300 outline-none"
                            />
                            <button
                                type="submit"
                                className="button-orange px-5 py-2.5 text-sm font-medium text-gray-900 cursor-pointer whitespace-nowrap"
                            >
                                Create a free Markaz Business account
                            </button>
                        </div>

                        {errors.email && (
                            <p className="text-sm text-red-300 mt-2">{errors.email.message}</p>
                        )}

                        <p className="text-xs text-white/70 mt-3">
                            Already have a business account?{" "}
                            <Link href="/auth/signin?callbackUrl=/business" className="underline">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </div>

                {/* Drawn rather than sourced so no Amazon artwork is reproduced. */}
                <div className="hidden lg:block" aria-hidden="true">
                    <svg viewBox="0 0 460 300" className="w-full h-auto" role="presentation">
                        <rect x="20" y="40" width="420" height="220" rx="10" fill="#0f1620" />
                        <rect x="20" y="40" width="420" height="34" rx="10" fill="#37475a" />
                        <circle cx="42" cy="57" r="5" fill="#febd69" />
                        <circle cx="60" cy="57" r="5" fill="#5a6b7d" />
                        <circle cx="78" cy="57" r="5" fill="#5a6b7d" />
                        <rect x="40" y="96" width="180" height="14" rx="4" fill="#e6eaf0" />
                        <rect x="40" y="122" width="120" height="10" rx="4" fill="#5a6b7d" />
                        <rect x="40" y="152" width="180" height="86" rx="6" fill="#1b2430" />
                        <rect x="56" y="206" width="26" height="20" fill="#febd69" />
                        <rect x="92" y="188" width="26" height="38" fill="#febd69" />
                        <rect x="128" y="172" width="26" height="54" fill="#f3a847" />
                        <rect x="164" y="196" width="26" height="30" fill="#febd69" />
                        <rect x="240" y="96" width="180" height="62" rx="6" fill="#1b2430" />
                        <circle cx="266" cy="127" r="14" fill="#37475a" />
                        <rect x="290" y="114" width="110" height="10" rx="4" fill="#5a6b7d" />
                        <rect x="290" y="132" width="76" height="8" rx="4" fill="#3d4a59" />
                        <rect x="240" y="176" width="180" height="62" rx="6" fill="#1b2430" />
                        <circle cx="266" cy="207" r="14" fill="#37475a" />
                        <rect x="290" y="194" width="110" height="10" rx="4" fill="#5a6b7d" />
                        <rect x="290" y="212" width="94" height="8" rx="4" fill="#3d4a59" />
                    </svg>
                </div>
            </div>
        </section>
    );
};

export default BusinessHero;
