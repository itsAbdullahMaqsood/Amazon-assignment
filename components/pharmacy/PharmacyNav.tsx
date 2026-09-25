"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ChevronDownIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

import { placeholder } from "@/components/profile/accountLinks";

const links = [
    { label: "Home", href: "/pharmacy" },
    { label: "How it works", href: placeholder("How Markaz Pharmacy works") },
    { label: "PillPack", href: placeholder("PillPack") },
];

export const PharmacyWordmark = ({ className = "" }: any) => (
    <span className={`text-2xl font-bold tracking-tight ${className}`}>
        markaz <span className="text-success">pharmacy</span>
    </span>
);

const PharmacyNav = () => {
    const { data: session }: any = useSession();

    return (
        <nav aria-label="Markaz Pharmacy" className="bg-white border-b border-slate-200">
            <div className="max-w-[1500px] mx-auto px-6 h-16 flex items-center gap-8">
                <Link href="/pharmacy">
                    <PharmacyWordmark />
                </Link>

                <ul className="hidden md:flex items-center gap-8 text-[15px]">
                    {links.map((link) => (
                        <li key={link.label}>
                            <Link href={link.href} className="hover:underline">
                                {link.label}
                            </Link>
                        </li>
                    ))}
                    <li>
                        <Link
                            href={placeholder("Markaz Pharmacy help")}
                            className="flex items-center gap-1 hover:underline"
                        >
                            <InformationCircleIcon className="w-5 h-5" />
                            Help
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/browse"
                            className="flex items-center gap-1 hover:underline"
                        >
                            Browse all health
                            <ChevronDownIcon className="w-4 h-4" />
                        </Link>
                    </li>
                </ul>

                <div className="ml-auto flex items-center gap-4 text-[15px]">
                    <span className="hidden md:flex items-center gap-1">
                        EN <ChevronDownIcon className="w-4 h-4" />
                    </span>

                    {session ? (
                        <button
                            onClick={() => signOut({ callbackUrl: "/pharmacy" })}
                            className="hover:underline cursor-pointer"
                        >
                            Sign out
                        </button>
                    ) : (
                        <p>
                            <Link href="/auth/register" className="hover:underline">
                                Sign up
                            </Link>
                            <span className="mx-1 text-slate-400">|</span>
                            <Link href="/auth/signin?callbackUrl=/pharmacy" className="hover:underline">
                                Sign in
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default PharmacyNav;
