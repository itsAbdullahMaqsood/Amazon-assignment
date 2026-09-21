"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDownIcon, GlobeAltIcon, UserCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { signOut, useSession } from "next-auth/react";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { closeMenu, selectMenu } from "@/redux/slices/MenuSlice";
import { menuSections } from "./menuLinks";

const row =
    "flex items-center w-full text-left text-sm md:text-base px-8 py-2.5 md:py-3 hover:bg-gray-200 cursor-pointer";

const MenuSideBar = () => {
    const dispatch = useAppDispatch();
    const menuOpened = useAppSelector(selectMenu);
    const { data: session }: any = useSession();

    // Amazon hides the tail of a long section behind "See all".
    const [expanded, setExpanded] = useState<string>("");

    const closeMenuHandler = () => {
        dispatch(closeMenu());
    };

    const firstName = session?.user?.name ? String(session.user.name).split(" ")[0] : "";

    return (
        <>
            <div
                className={`fixed top-0 left-0 w-[85%] max-w-sm md:w-96 h-screen bg-white z-50 transition duration-300 ${
                    menuOpened ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {session ? (
                    <Link
                        href="/profile"
                        onClick={closeMenuHandler}
                        className="bg-amazon-blue_light text-white flex items-center px-8 py-3"
                    >
                        <UserCircleIcon className="h-8 mr-2" />
                        <span className="font-bold text-lg truncate">Hello, {firstName}</span>
                    </Link>
                ) : (
                    <Link
                        href="/auth/signin"
                        onClick={closeMenuHandler}
                        className="bg-amazon-blue_light text-white flex items-center px-8 py-3"
                    >
                        <UserCircleIcon className="h-8 mr-2" />
                        <span className="font-bold text-lg">Hello, sign in</span>
                    </Link>
                )}

                <button
                    onClick={closeMenuHandler}
                    aria-label="Close the menu"
                    className="absolute top-3 -right-12 text-white cursor-pointer"
                >
                    <XMarkIcon className="h-8" />
                </button>

                <div className="h-[calc(100vh-56px)] overflow-y-auto pb-20">
                    {menuSections.map((section) => {
                        const hidden = section.links.filter((link: any) => link.more).length > 0;
                        const open = expanded === section.title;
                        const visible = section.links.filter(
                            (link: any) => open || !link.more
                        );

                        return (
                            <div key={section.title} className="border-b border-gray-200 py-2">
                                <h3 className="font-bold text-base md:text-lg px-8 py-3">
                                    {section.title}
                                </h3>

                                <ul>
                                    {visible.map((link: any) => (
                                        <li key={link.label}>
                                            <Link
                                                href={link.href}
                                                onClick={closeMenuHandler}
                                                className={row}
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}

                                    {hidden && (
                                        <li>
                                            <button
                                                onClick={() =>
                                                    setExpanded(open ? "" : section.title)
                                                }
                                                className={row}
                                            >
                                                {open ? "See less" : "See all"}
                                                <ChevronDownIcon
                                                    className={`h-5 ml-2 text-gray-500 stroke-2 transition-transform ${
                                                        open ? "rotate-180" : ""
                                                    }`}
                                                />
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        );
                    })}

                    <div className="py-2">
                        <ul>
                            <li className={`${row} cursor-default hover:bg-transparent gap-2`}>
                                <GlobeAltIcon className="h-5 text-gray-500" />
                                English
                            </li>
                            <li className={`${row} cursor-default hover:bg-transparent gap-2`}>
                                <span aria-hidden="true">🇺🇸</span>
                                United States
                            </li>
                            <li>
                                {session ? (
                                    <button
                                        onClick={() => {
                                            closeMenuHandler();
                                            signOut({ callbackUrl: "/" });
                                        }}
                                        className={row}
                                    >
                                        Sign Out
                                    </button>
                                ) : (
                                    <Link
                                        href="/auth/signin"
                                        onClick={closeMenuHandler}
                                        className={row}
                                    >
                                        Sign In
                                    </Link>
                                )}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {menuOpened && (
                <div
                    onClick={closeMenuHandler}
                    className="fixed top-0 left-0 w-full h-full bg-zinc-900/85 z-40"
                />
            )}
        </>
    );
};

export default MenuSideBar;
