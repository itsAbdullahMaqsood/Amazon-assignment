"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";

const Empty = () => {
    const { data: session }: any = useSession();

    return (
        <div className="bg-white rounded border border-gray-200 mt-6 py-6 mx-4 flex flex-col items-center space-y-4">
            <ShoppingBagIcon className="w-20 h-20" />

            <h2 className="font-bold text-3xl">Cart is Empty</h2>

            <Link
                href="/browse"
                className="w-52 text-center rounded-full p-2 font-semibold text-amazon-blue_dark bg-linear-to-r from-amazon-orange to-yellow-300 hover:text-slate-100 hover:from-amazon-blue_light hover:to-slate-300 transition duration-300"
            >
                SHOP NOW
            </Link>

            {!session && (
                <Link
                    href="/auth/signin?callbackUrl=/cart"
                    className="w-52 text-center rounded-full p-2 bg-amazon-blue_light text-slate-100"
                >
                    Sign In / Register
                </Link>
            )}
        </div>
    );
};

export default Empty;
