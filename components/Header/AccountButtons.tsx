import Link from "next/link";
import { useRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/react";
import { ChevronDownIcon, ChevronRightIcon, ShoppingCartIcon, UserIcon } from "@heroicons/react/24/outline";

import { useAppSelector } from "@/redux/hooks";

const yourList = ["Create a list", "Find a list or Registry"];
const yourAccount = ["Account", "Orders", "Registry", "Recommendations", "Browsing History"];

const AccountButtons = () => {
    const router = useRouter();
    const { data: session }: any = useSession();
    const cart = useAppSelector((state) => state.cart);

    return (
        <div className="flex items-center space-x-6 ml-auto md:ml-0 text-white">
            <Link href="/auth/signin" className="flex items-center md:hidden text-xs">
                <span>Sign in</span>
                <ChevronRightIcon className="h-3 stroke-[3]" />
                <UserIcon className="h-6 ml-1" />
            </Link>

            <div className="hidden md:flex show-account relative link">
                <div>
                    <p className="text-xs text-slate-300">
                        Hello, {session ? session.user.name : "sign in"}
                    </p>
                    <p className="font-bold text-sm flex items-center">
                        Account &amp; Lists
                        <ChevronDownIcon className="h-4 text-slate-300 stroke-[3]" />
                    </p>
                </div>

                <div className="show-account-popup absolute top-full right-0 pt-4 z-50">
                    <div className="absolute top-2 right-12 h-3 w-3 bg-white rotate-45" />
                    <div className="w-96 bg-white text-black rounded shadow-lg p-5">
                        <div className="flex flex-col items-center border-b pb-4">
                            {session ? (
                                <>
                                    <Link href="/profile" className="text-sm font-semibold link mb-3">
                                        Hi, {session.user.name}
                                    </Link>
                                    <div className="flex items-center space-x-3">
                                        <Link
                                            href="/profile"
                                            className="button-orange text-xs px-6 py-1.5"
                                        >
                                            Profile
                                        </Link>
                                        <button
                                            onClick={() => signOut()}
                                            className="button-orange text-xs px-6 py-1.5"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => signIn()}
                                        className="button-orange text-xs px-10 py-1.5"
                                    >
                                        Sign in
                                    </button>
                                    <p className="text-xs mt-2">
                                        New customer?{" "}
                                        <Link href="/auth/register" className="text-blue-600 link">
                                            start here
                                        </Link>
                                    </p>
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div>
                                <h5 className="font-semibold text-sm mb-2">Your List</h5>
                                <ul className="text-xs text-gray-600 space-y-1.5">
                                    {yourList.map((item) => (
                                        <li key={item} className="link">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="border-l pl-4">
                                <h5 className="font-semibold text-sm mb-2">Your Account</h5>
                                <ul className="text-xs text-gray-600 space-y-1.5">
                                    {yourAccount.map((item) => (
                                        <li key={item} className="link">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="hidden md:block link">
                <p className="text-xs text-slate-300">Returns</p>
                <p className="font-bold text-sm">&amp; Orders</p>
            </div>

            <div
                onClick={() => router.push("/cart")}
                className="flex items-center relative link"
            >
                <ShoppingCartIcon className="h-10" />
                <span className="absolute top-0 left-4 h-5 w-5 bg-amazon-orange text-black font-bold text-xs rounded-full flex items-center justify-center">
                    {cart.cartItems.length}
                </span>
                <p className="hidden md:inline font-bold text-sm mt-4">Cart</p>
            </div>
        </div>
    );
};

export default AccountButtons;
