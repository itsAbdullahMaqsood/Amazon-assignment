"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/components/ui/cn";

const links = [
    { label: "Browse", href: "/movies" },
    { label: "My list", href: "/movies/my-list" },
];

// Markaz Movies sits inside the store, so this is a place marker and two links,
// not a second navigation bar competing with the store header above it.
const MoviesBar = ({ note }: any) => {
    const pathname = usePathname();

    return (
        <div className="border-b border-fg-inverse/10">
            <div className="mx-auto flex max-w-page flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
                <Link href="/movies" className="font-display text-lg font-semibold tracking-tight text-fg-inverse">
                    Markaz Movies
                </Link>

                <nav aria-label="Markaz Movies" className="flex items-center gap-4">
                    {links.map((link) => {
                        const current = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                aria-current={current ? "page" : undefined}
                                className={cn(
                                    "text-sm font-medium",
                                    current ? "text-fg-inverse underline underline-offset-4 decoration-accent decoration-2" : "text-fg-inverse-muted hover:text-fg-inverse"
                                )}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {note && <p className="ml-auto text-xs text-fg-inverse-muted">{note}</p>}
            </div>
        </div>
    );
};

export default MoviesBar;
