"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, ChevronDownIcon, MapPinIcon } from "@heroicons/react/24/outline";

import AlexaLauncher from "@/components/alexa/AlexaLauncher";

// Partner names stay as plain text labels rather than reproduced logos.
const links = [
    { label: "Early Plus Deals", href: "/browse?sort=topSelling" },
    { label: "Markaz Movies", href: "/movies" },
    { label: "Buy Again", href: "/buy-again" },
    { label: "Groceries", href: "/groceries" },
    { label: "Coupons", href: "/coupons" },
    { label: "Pharmacy", href: "/pharmacy" },
    { label: "Electronics", href: "/browse?category=electronics" },
    { label: "Markaz Home", href: "/furniture", caret: true },
    { label: "Registry", href: "/registry" },
    { label: "Beauty", href: "/browse?category=beauty" },
    { label: "Whole Foods", href: "/groceries" },
];

const HeaderBottom = ({ handleOpenMenu }: any) => {
    const pathname = usePathname();

    return (
        <>
            <nav
                aria-label="Shop by department"
                className="bg-ink-900 md:bg-ink-800 text-white flex items-center px-3 md:px-4 text-sm"
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
                        <AlexaLauncher />
                    </li>

                    <li>
                        <Link
                            href="/plus"
                            className="bg-white text-ink-900 font-semibold rounded-full px-3 py-1"
                        >
                            Join Plus
                        </Link>
                    </li>

                    {links.map((link) => (
                        <li key={link.label}>
                            <Link
                                href={link.href}
                                aria-current={pathname === link.href ? "page" : undefined}
                                className={`link flex items-center ${
                                    pathname === link.href ? "font-bold" : ""
                                }`}
                            >
                                {link.label}
                                {link.caret && <ChevronDownIcon className="h-3 ml-1 stroke-[3]" />}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="md:hidden bg-ink-800 text-white flex items-center px-3 py-2 text-sm">
                <MapPinIcon className="h-5 mr-1" />
                <span>Deliver to Germany</span>
            </div>
        </>
    );
};

export default HeaderBottom;
