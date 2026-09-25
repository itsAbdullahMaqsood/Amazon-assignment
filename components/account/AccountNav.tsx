"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";

import Sheet from "@/components/ui/Sheet";
import { cn } from "@/components/ui/cn";
import { accountSections, overviewLink, sectionFor } from "./sections";

const itemClass = (current: boolean) =>
    cn(
        "block rounded-control px-3 py-2 text-sm transition-colors",
        current ? "bg-accent-soft font-medium text-accent-deep" : "text-fg-muted hover:bg-surface-muted hover:text-fg"
    );

const List = ({ pathname, onNavigate }: any) => (
    <>
        <Link href={overviewLink.href} aria-current={pathname === overviewLink.href ? "page" : undefined} onClick={onNavigate} className={itemClass(pathname === overviewLink.href)}>
            {overviewLink.label}
        </Link>

        {accountSections.map((section) => (
            <div key={section.heading} className="mt-5">
                <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-fg-subtle">{section.heading}</p>
                <ul>
                    {section.links.map((link: any) => {
                        const current = pathname === link.href;

                        return (
                            <li key={link.href}>
                                <Link href={link.href} aria-current={current ? "page" : undefined} onClick={onNavigate} className={itemClass(current)}>
                                    {link.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        ))}
    </>
);

// The account's own navigation. On desktop it is a rail beside the page; on a
// phone it collapses to one button naming the section you are in, because
// several of these pages (orders, returns) already carry a row of tabs of their
// own and two scrolling rows would compete.
const AccountNav = () => {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const current = sectionFor(pathname);

    return (
        <>
            <nav aria-label="Account sections" className="hidden lg:block sticky top-8">
                <List pathname={pathname} />
            </nav>

            <div className="lg:hidden">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-haspopup="dialog"
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-3 rounded-card border border-line bg-surface px-4 py-3 text-left cursor-pointer hover:border-line-strong"
                >
                    <span className="min-w-0">
                        <span className="block text-xs text-fg-subtle">Your account</span>
                        <span className="block truncate text-sm font-medium text-fg">{current.label}</span>
                    </span>
                    <ChevronUpDownIcon className="h-5 w-5 shrink-0 text-fg-muted" aria-hidden="true" />
                </button>

                <Sheet open={open} onClose={() => setOpen(false)} side="bottom" title="Your account">
                    <nav aria-label="Account sections">
                        <List pathname={pathname} onNavigate={() => setOpen(false)} />
                    </nav>
                </Sheet>
            </div>
        </>
    );
};

export default AccountNav;
