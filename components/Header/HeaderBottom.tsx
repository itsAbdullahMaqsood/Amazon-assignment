"use client";

import Link from "next/link";
import { Bars3Icon, ChevronDownIcon, MapPinIcon } from "@heroicons/react/24/outline";

import { placeholder } from "@/components/profile/accountLinks";

// Partner names stay as plain text labels rather than reproduced logos.
const links = [
    { label: "Early Prime Deals", href: placeholder("Early Prime Deals") },
    { label: "Prime Video", href: "/prime-video" },
    { label: "Buy Again", href: "/buy-again" },
    { label: "Groceries", href: placeholder("Groceries") },
    { label: "Coupons", href: placeholder("Coupons") },
    { label: "Pharmacy", href: placeholder("Pharmacy") },
    { label: "Automotive", href: placeholder("Automotive") },
    { label: "Amazon Home", href: placeholder("Amazon Home"), caret: true },
    { label: "Registry", href: placeholder("Registry") },
    { label: "Video Games", href: placeholder("Video Games") },
    { label: "Whole Foods", href: placeholder("Whole Foods") },
];

const HeaderBottom = ({ handleOpenMenu }: any) => {
    return (
        <>
            <nav
                aria-label="Shop by department"
                className="bg-amazon-blue_dark md:bg-amazon-blue_light text-white flex items-center px-3 md:px-4 text-sm"
            >
                <button
                    onClick={handleOpenMenu}
                    className="hidden md:flex items-center link p-2 shrink-0 cursor-pointer"
                >
                    <Bars3Icon className="h-6 mr-1" />
                    <span className="font-bold">All</span>
                </button>

                <ul className="flex items-center gap-4 overflow-x-scroll scrollbar-hide whitespace-nowrap py-2 md:ml-2 w-full">
                    <li>
                        <Link
                            href={placeholder("Alexa for shopping")}
                            className="flex items-center bg-white/10 rounded-full px-3 py-1"
                        >
                            <span className="italic lowercase mr-1">alexa</span> for shopping
                        </Link>
                    </li>

                    <li>
                        <Link
                            href={placeholder("Join Prime")}
                            className="bg-white text-amazon-blue_dark font-semibold rounded-full px-3 py-1"
                        >
                            Join Prime
                        </Link>
                    </li>

                    {links.map((link) => (
                        <li key={link.label}>
                            <Link href={link.href} className="link flex items-center">
                                {link.label}
                                {link.caret && <ChevronDownIcon className="h-3 ml-1 stroke-[3]" />}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="md:hidden bg-amazon-blue_light text-white flex items-center px-3 py-2 text-sm">
                <MapPinIcon className="h-5 mr-1" />
                <span>Deliver to Germany</span>
            </div>
        </>
    );
};

export default HeaderBottom;
