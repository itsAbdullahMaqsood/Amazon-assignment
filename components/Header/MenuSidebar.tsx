"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { closeMenu, selectMenu } from "@/redux/slices/MenuSlice";
import Sheet from "@/components/ui/Sheet";
import Wordmark from "@/components/ui/Wordmark";
import Button from "@/components/ui/Button";
import { Avatar, firstName } from "./HeaderActions";
import { accountLinks, helpLinks, quickLinks, stores } from "./navigation";

const Section = ({ title, links, onNavigate }: any) => (
    <section className="py-3">
        <h3 className="px-5 pb-1 text-xs font-semibold uppercase tracking-wider text-fg-subtle">{title}</h3>
        <ul>
            {links.map((link: any) => (
                <li key={link.href}>
                    <Link
                        href={link.href}
                        onClick={onNavigate}
                        className="flex items-center justify-between px-5 py-2.5 text-base text-fg hover:bg-surface-muted"
                    >
                        {link.label}
                        <ChevronRightIcon className="h-4 w-4 text-fg-subtle" />
                    </Link>
                </li>
            ))}
        </ul>
    </section>
);

// The phone menu: who you are, then Shop / Stores / Your account / Help. Every
// row goes to a real page.
const MenuSideBar = ({ departments = [] }: any) => {
    const dispatch = useAppDispatch();
    const open = useAppSelector(selectMenu);
    const { data: session }: any = useSession();
    const close = () => dispatch(closeMenu());
    const user = session?.user;

    return (
        <Sheet open={open} onClose={close} side="left" title="Menu" hideHeader bodyClassName="flex flex-col">
            <div className="flex items-center justify-between bg-ink-900 px-5 py-4">
                <Wordmark size="sm" />
                <button type="button" onClick={close} className="text-sm text-fg-inverse-muted hover:text-fg-inverse cursor-pointer">
                    Close
                </button>
            </div>

            <div className="border-b border-line px-5 py-4">
                {user ? (
                    <Link href="/profile" onClick={close} className="flex items-center gap-3">
                        <Avatar user={user} className="h-10 w-10 text-base" />
                        <span className="min-w-0">
                            <span className="block font-medium">Hi, {firstName(user.name)}</span>
                            <span className="block truncate text-sm text-fg-muted">{user.email}</span>
                        </span>
                    </Link>
                ) : (
                    <div className="flex gap-2">
                        <Button href="/auth/signin" onClick={close} block>
                            Sign in
                        </Button>
                        <Button href="/auth/register" onClick={close} variant="outline" block>
                            Create account
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex-1 divide-y divide-line overflow-y-auto">
                <Section
                    title="Shop"
                    onNavigate={close}
                    links={[
                        { label: "All departments", href: "/browse" },
                        ...departments.map((d: any) => ({ label: d.name, href: `/browse?category=${d.slug}` })),
                        ...quickLinks,
                    ]}
                />
                <Section title="Stores" links={stores} onNavigate={close} />
                {user && <Section title="Your account" links={accountLinks} onNavigate={close} />}
                <Section title="Help" links={helpLinks} onNavigate={close} />

                {user && (
                    <div className="px-5 py-4">
                        <Button variant="outline" block onClick={() => signOut({ callbackUrl: "/" })}>
                            Sign out
                        </Button>
                    </div>
                )}
            </div>
        </Sheet>
    );
};

export default MenuSideBar;
