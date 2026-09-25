"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChevronDownIcon, ChevronRightIcon, ShoppingCartIcon, UserIcon } from "@heroicons/react/24/outline";

import { useAppSelector } from "@/redux/hooks";
import AccountFlyout from "./AccountFlyout";

const AccountButtons = () => {
    const { data: session }: any = useSession();
    const cart = useAppSelector((state) => state.cart);

    return (
        <div className="flex items-center space-x-6 ml-auto md:ml-0 text-white">
            <Link href="/auth/signin" className="flex items-center md:hidden text-xs">
                <span>Sign in</span>
                <ChevronRightIcon className="h-3 stroke-3" />
                <UserIcon className="h-6 ml-1" />
            </Link>

            <AccountFlyout />

            <Link href="/profile/returns" className="hidden md:block link">
                <p className="text-xs text-slate-300">Returns</p>
                <p className="font-bold text-sm">&amp; Orders</p>
            </Link>

            <Link href="/cart" aria-label={`Cart, ${cart.cartItems.length} items`} className="flex items-center relative link">
                <ShoppingCartIcon className="h-10" />
                <span className="absolute top-0 left-4 h-5 w-5 bg-accent text-black font-bold text-xs rounded-full flex items-center justify-center">
                    {cart.cartItems.length}
                </span>
                <p className="hidden md:inline font-bold text-sm mt-4">Cart</p>
            </Link>
        </div>
    );
};

export default AccountButtons;
