"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
    ArchiveBoxIcon,
    ArrowRightStartOnRectangleIcon,
    ChevronDownIcon,
    ShoppingBagIcon,
    SparklesIcon,
    Squares2X2Icon,
    UserIcon,
} from "@heroicons/react/24/outline";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { openAssistant } from "@/redux/slices/AssistantSlice";
import Popover from "@/components/ui/Popover";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { accountLinks, stores } from "./navigation";

const chrome =
    "flex items-center gap-2 h-10 rounded-card px-2.5 text-sm text-fg-inverse hover:bg-fg-inverse/10 transition-colors cursor-pointer";

export const firstName = (name: string) => String(name || "").trim().split(/\s+/)[0] || "";

export const Avatar = ({ user, className = "" }: any) => (
    <span
        aria-hidden="true"
        className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold uppercase text-fg",
            className
        )}
    >
        {user?.name ? firstName(user.name).charAt(0) : <UserIcon className="h-4 w-4" />}
    </span>
);

export const ShabanaButton = () => {
    const dispatch = useAppDispatch();

    return (
        <button
            type="button"
            onClick={() => dispatch(openAssistant())}
            aria-haspopup="dialog"
            aria-label="Ask Shabana, the shopping assistant"
            className={cn(chrome, "lg:bg-fg-inverse/10 lg:hover:bg-fg-inverse/20 lg:pr-3.5")}
        >
            <SparklesIcon className="h-5 w-5 text-accent" />
            <span className="hidden lg:inline font-medium">Ask Shabana</span>
        </button>
    );
};

export const CartLink = () => {
    const pathname = usePathname();
    const count = useAppSelector((state) =>
        state.cart.cartItems.reduce((sum: number, item: any) => sum + (Number(item.qty) || 0), 0)
    );

    return (
        <Link
            href="/cart"
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
            aria-current={pathname === "/cart" ? "page" : undefined}
            className={cn(chrome, "relative")}
        >
            <ShoppingBagIcon className="h-6 w-6" />
            <span className="hidden md:inline font-medium">Cart</span>
            {count > 0 && (
                <span className="absolute left-5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-fg tabular md:static md:ml-0">
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </Link>
    );
};

export const OrdersLink = () => (
    <Link href="/profile/orders" className={cn(chrome, "hidden lg:flex")}>
        <ArchiveBoxIcon className="h-5 w-5" />
        <span className="font-medium">Orders</span>
    </Link>
);

export const AccountMenu = () => {
    const { data: session, status }: any = useSession();
    const pathname = usePathname();
    const user = session?.user;
    const signInHref = `/auth/signin?callbackUrl=${encodeURIComponent(pathname || "/")}`;

    if (status !== "loading" && !user) {
        return (
            <Link href={signInHref} className={chrome}>
                <UserIcon className="h-5 w-5" />
                <span className="hidden sm:inline font-medium">Sign in</span>
            </Link>
        );
    }

    return (
        <Popover
            triggerLabel="Your account"
            triggerClassName={chrome}
            className="w-72 p-2"
            trigger={
                <>
                    <Avatar user={user} />
                    <span className="hidden md:inline max-w-28 truncate font-medium">{user ? firstName(user.name) : "Account"}</span>
                    <ChevronDownIcon className="hidden md:block h-4 w-4 text-fg-inverse-muted" />
                </>
            }
        >
            <div className="flex items-center gap-3 px-3 py-3">
                <Avatar user={user} className="h-10 w-10 text-base" />
                <div className="min-w-0">
                    <p className="truncate font-medium">{user?.name}</p>
                    <p className="truncate text-sm text-fg-muted">{user?.email}</p>
                </div>
            </div>

            <div className="my-1 h-px bg-line" />

            <ul>
                {accountLinks.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className="flex rounded-card px-3 py-2 text-sm hover:bg-surface-muted"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
                {user?.role === "admin" && (
                    <li>
                        <Link href="/admin/dashboard" className="flex rounded-card px-3 py-2 text-sm text-accent-ink hover:bg-surface-muted">
                            Admin dashboard
                        </Link>
                    </li>
                )}
            </ul>

            <div className="my-1 h-px bg-line" />

            <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-2 rounded-card px-3 py-2 text-sm text-fg-muted hover:bg-surface-muted hover:text-fg cursor-pointer"
            >
                <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                Sign out
            </button>
        </Popover>
    );
};

export const StoresMenu = () => (
    <Popover
        triggerClassName="flex items-center gap-1 rounded-control px-3 py-1.5 text-sm text-fg-inverse-muted hover:bg-fg-inverse/10 hover:text-fg-inverse cursor-pointer"
        className="w-[34rem] p-3"
        trigger={
            <>
                <Squares2X2Icon className="h-4 w-4" />
                More stores
                <ChevronDownIcon className="h-3.5 w-3.5" />
            </>
        }
    >
        <ul className="grid grid-cols-2 gap-1">
            {stores.map((store) => (
                <li key={store.href}>
                    <Link href={store.href} className="block rounded-card px-3 py-2.5 hover:bg-surface-muted">
                        <span className="block text-sm font-medium">{store.label}</span>
                        <span className="block text-sm text-fg-muted">{store.description}</span>
                    </Link>
                </li>
            ))}
        </ul>
        <div className="mt-2 flex items-center justify-between rounded-card bg-surface-muted px-3 py-2.5 text-sm">
            <span className="text-fg-muted">Looking for something specific?</span>
            <Link href="/browse" className={buttonClass({ variant: "outline", size: "sm" })}>
                All departments
            </Link>
        </div>
    </Popover>
);
