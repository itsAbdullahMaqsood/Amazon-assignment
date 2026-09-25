"use client";

import Link from "next/link";

import Wordmark from "@/components/ui/Wordmark";
import Image from "next/image";
import { signIn } from "next-auth/react";

const providers = [
    { id: "google", name: "Google" },
    { id: "github", name: "Github" },
];

export const OAuthRow = ({ verb = "Sign in" }: any) => {
    return (
        <div className="flex flex-col md:flex-row gap-3 mt-4">
            {providers.map((provider) => (
                <button
                    key={provider.id}
                    onClick={() => signIn(provider.id)}
                    className="flex items-center justify-center gap-2 w-full border border-slate-300 rounded-xl p-2 text-sm hover:bg-slate-50 cursor-pointer"
                >
                    <Image
                        src={`/assets/images/${provider.id}.png`}
                        alt={provider.name}
                        width={28}
                        height={28}
                    />
                    {verb} with {provider.name}
                </button>
            ))}
        </div>
    );
};

export const AuthCard = ({ children }: any) => (
    <div className="w-full px-4 sm:w-3/5 md:w-3/5 lg:w-2/5 pt-8 pb-16 mx-auto">
        <Link href="/" className="flex justify-center">
            <Wordmark tone="dark" size="lg" />
        </Link>

        {children}
    </div>
);
