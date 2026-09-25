"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon } from "@heroicons/react/24/outline";

import { useAppDispatch } from "@/redux/hooks";
import { openMenu } from "@/redux/slices/MenuSlice";
import Wordmark from "@/components/ui/Wordmark";
import IconButton from "@/components/ui/IconButton";
import { cn } from "@/components/ui/cn";
import Search from "./Search";
import { AccountMenu, CartLink, OrdersLink, ShabanaButton, StoresMenu } from "./HeaderActions";
import { quickLinks } from "./navigation";

const SearchFallback = () => <div className="h-11 w-full rounded-card bg-surface" />;

const navLink = (active: boolean) =>
    cn(
        "flex h-8 items-center whitespace-nowrap rounded-control px-3 text-sm transition-colors",
        active ? "bg-fg-inverse/10 text-fg-inverse font-medium" : "text-fg-inverse-muted hover:bg-fg-inverse/10 hover:text-fg-inverse"
    );

// Two rows. The first is everything a shopper reaches for (search, Shabana,
// account, orders, cart); the second is where to shop: the departments as they
// exist in the database, then Deals, Movies and the other storefronts.
const Header = ({ departments = [], searchDepartments = [] }: any) => {
    const dispatch = useAppDispatch();
    const pathname = usePathname();

    return (
        <header className="relative z-[55] bg-ink-900 text-fg-inverse">
            <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
                <div className="flex h-14 items-center gap-2 md:h-16 md:gap-6">
                    <IconButton
                        tone="inverse"
                        label="Open menu"
                        onClick={() => dispatch(openMenu())}
                        className="-ml-2 md:hidden"
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </IconButton>

                    <Link href="/" aria-label="Markaz home" className="shrink-0 rounded-control py-1">
                        <Wordmark />
                    </Link>

                    <div className="hidden flex-1 md:block md:max-w-3xl">
                        <Suspense fallback={<SearchFallback />}>
                            <Search departments={searchDepartments} />
                        </Suspense>
                    </div>

                    <div className="ml-auto flex items-center gap-0.5 md:gap-1">
                        <ShabanaButton />
                        <AccountMenu />
                        <OrdersLink />
                        <CartLink />
                    </div>
                </div>

                <div className="pb-3 md:hidden">
                    <Suspense fallback={<SearchFallback />}>
                        <Search departments={searchDepartments} />
                    </Suspense>
                </div>
            </div>

            <nav aria-label="Shop" className="border-t border-fg-inverse/5 bg-ink-800">
                <div className="mx-auto flex h-11 max-w-page items-center gap-2 px-2 sm:px-4 lg:px-6">
                    <ul className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto scrollbar-hide">
                        {quickLinks.map((link) => (
                            <li key={link.href} className="md:hidden">
                                <Link href={link.href} className={navLink(pathname === link.href)}>
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <Link href="/browse" className={navLink(pathname === "/browse" && false)}>
                                All
                            </Link>
                        </li>
                        {departments.map((department: any) => (
                            <li key={department.slug}>
                                <Link href={`/browse?category=${department.slug}`} className={navLink(false)}>
                                    {department.name}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="hidden shrink-0 items-center gap-0.5 border-l border-fg-inverse/10 pl-2 md:flex">
                        {quickLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                aria-current={pathname.startsWith(link.href) ? "page" : undefined}
                                className={navLink(pathname.startsWith(link.href))}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <StoresMenu />
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
