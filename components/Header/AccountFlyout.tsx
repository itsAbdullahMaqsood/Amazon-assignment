"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

import { flyoutAccount, flyoutLists } from "@/components/profile/accountLinks";

const AccountFlyout = () => {
    const { data: session }: any = useSession();
    const pathname = usePathname();
    const [open, setOpen] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const panelId = useId();

    // next-auth's signIn() with no provider hard-navigates to /api/auth/signin,
    // which only bounces back here once the config is read. Link to our own page.
    const signInHref = `/auth/signin?callbackUrl=${encodeURIComponent(pathname || "/")}`;

    // Closing on navigation is a render-time adjustment: an effect that only
    // calls setState would trigger a second render pass.
    const [lastPath, setLastPath] = useState(pathname);

    if (lastPath !== pathname) {
        setLastPath(pathname);
        setOpen(false);
    }

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        const onClick = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onClick);

        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onClick);
        };
    }, []);

    const firstName = session?.user?.name?.split(" ")[0] || "";

    return (
        <div
            ref={containerRef}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            className="hidden md:block relative"
        >
            <button
                onClick={() => setOpen(!open)}
                onFocus={() => setOpen(true)}
                aria-haspopup="true"
                aria-expanded={open}
                aria-controls={panelId}
                className="text-left cursor-pointer"
            >
                <p className="text-xs text-slate-300">
                    Hello, {session ? firstName : "sign in"}
                </p>
                <p className="font-bold text-sm flex items-center">
                    Account &amp; Lists
                    <ChevronDownIcon className="h-4 text-slate-300 stroke-[3]" />
                </p>
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 top-[100px] bg-black/40 z-40" aria-hidden="true" />

                    <div
                        id={panelId}
                        className="absolute top-full right-0 pt-3 z-50"
                        role="dialog"
                        aria-label="Account and lists"
                    >
                        <div className="absolute top-1 right-12 h-4 w-4 bg-white rotate-45" />

                        <div className="w-[560px] max-h-[75vh] overflow-y-auto bg-white text-black rounded shadow-2xl p-4">
                            {session ? (
                                <div className="flex items-center gap-3 bg-accent-soft rounded-lg p-3">
                                    <Image
                                        src={session.user.image || "/assets/images/user-image-default.jpg"}
                                        alt=""
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />

                                    <div className="min-w-0">
                                        <p className="font-bold leading-tight">{firstName}</p>
                                        <p className="text-sm text-slate-700 truncate max-w-[220px]">
                                            {session.user.email}
                                        </p>
                                    </div>

                                    <div className="ml-auto flex items-center gap-4 text-accent-ink text-sm">
                                        <button
                                            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                                            className="hover:underline cursor-pointer"
                                        >
                                            Switch Accounts
                                        </button>
                                        <button
                                            onClick={() => signOut({ callbackUrl: "/" })}
                                            className="hover:underline cursor-pointer"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 bg-accent-soft rounded-lg p-4">
                                    <Link
                                        href={signInHref}
                                        className="button-orange px-10 py-1.5 text-sm text-center"
                                    >
                                        Sign in
                                    </Link>
                                    <p className="text-xs">
                                        New customer?{" "}
                                        <Link href="/auth/register" className="text-accent-ink hover:underline">
                                            Start here
                                        </Link>
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6 mt-4">
                                <div>
                                    <h3 className="text-lg font-bold mb-2">Your Lists</h3>
                                    <ul className="space-y-1.5 text-sm">
                                        {flyoutLists.map((item) => (
                                            <li key={item.label}>
                                                <Link href={item.href} className="hover:underline">
                                                    {item.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="border-l border-slate-200 pl-6">
                                    <h3 className="text-lg font-bold mb-2">Your Account</h3>
                                    <ul className="space-y-1.5 text-sm">
                                        {flyoutAccount.map((item) => (
                                            <li key={item.label}>
                                                <Link href={item.href} className="hover:underline">
                                                    {item.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AccountFlyout;
