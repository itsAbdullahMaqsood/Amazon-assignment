"use client";

import { useState } from "react";
import Link from "next/link";
import {
    BookmarkIcon,
    MagnifyingGlassIcon,
    Squares2X2Icon,
    UserCircleIcon,
} from "@heroicons/react/24/outline";

import { placeholder } from "@/components/profile/accountLinks";

const tabs = ["Home", "Movies", "TV shows", "Sports"];

const PrimeNav = () => {
    const [active, setActive] = useState<string>("Home");

    return (
        <div className="flex items-center gap-2 px-3 md:px-6 py-3 overflow-x-auto scrollbar-hide">
            <Link href="/prime-video" className="mr-2 md:mr-4 text-lg lowercase tracking-tight shrink-0">
                <span className="font-semibold">prime</span> video
            </Link>

            <nav aria-label="Prime Video sections" className="flex items-center gap-1 shrink-0">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActive(tab)}
                        aria-current={active === tab ? "page" : undefined}
                        className={`px-3 md:px-4 py-2 rounded font-semibold text-base md:text-lg cursor-pointer ${
                            active === tab ? "bg-white/15" : "hover:bg-white/10"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </nav>

            <div className="ml-auto flex items-center gap-3 md:gap-5 text-white/90 shrink-0 pl-3">
                <Link href={placeholder("Prime Video search")} aria-label="Search Prime Video">
                    <MagnifyingGlassIcon className="w-6 h-6" />
                </Link>
                <Link href={placeholder("Prime Video apps")} aria-label="Categories">
                    <Squares2X2Icon className="w-6 h-6" />
                </Link>
                <Link href={placeholder("Watchlist")} aria-label="Watchlist">
                    <BookmarkIcon className="w-6 h-6" />
                </Link>
                <Link href="/profile" aria-label="Your account">
                    <UserCircleIcon className="w-7 h-7 text-sky-400" />
                </Link>
            </div>
        </div>
    );
};

export default PrimeNav;
