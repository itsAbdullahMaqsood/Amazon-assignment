"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bars3Icon } from "@heroicons/react/24/outline";

import { useAppDispatch } from "@/redux/hooks";
import { openMenu } from "@/redux/slices/MenuSlice";
import Search from "./Search";
import DeliveryTo from "./DeliveryTo";
import Language from "./Language";
import AccountButtons from "./AccountButtons";
import HeaderBottom from "./HeaderBottom";

import amazonLogo from "@/public/assets/images/amazon-logo.png";

// `title` is kept on the props for call-site compatibility; the document title,
// description and viewport are now declared as metadata in app/layout.tsx.
const Header = ({ title, searchHandler }: any) => {
    const dispatch = useAppDispatch();

    const openMenuHandler = () => {
        dispatch(openMenu());
    };

    return (
        <header>
            <div className="bg-amazon-blue_dark flex flex-col md:flex-row">
                <div className="flex grow items-center p-3 md:space-x-5 md:px-4 text-white">
                    <Bars3Icon
                        className="h-8 md:hidden cursor-pointer mr-3"
                        onClick={openMenuHandler}
                    />

                    <Link href="/">
                        <Image
                            src={amazonLogo}
                            alt="amazon logo"
                            className="object-contain w-20 md:w-28 pt-2"
                            width={150}
                            height={45}
                        />
                    </Link>

                    <DeliveryTo />

                    <div className="hidden md:flex grow">
                        <Suspense fallback={null}>
                            <Search searchHandler={searchHandler} />
                        </Suspense>
                    </div>

                    <Language />

                    <AccountButtons />
                </div>

                <div className="md:hidden">
                    <Suspense fallback={null}>
                        <Search />
                    </Suspense>
                </div>
            </div>

        <HeaderBottom handleOpenMenu={openMenuHandler} />
        </header>
    );
};

export default Header;
