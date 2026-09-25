import Link from "next/link";

import { placeholder } from "@/components/profile/accountLinks";

const tabs = [
    { label: "Today's Deals", href: placeholder("Today's Deals") },
    { label: "Coupons", href: "/coupons" },
    { label: "Renewed Deals", href: placeholder("Renewed Deals") },
    { label: "Outlet", href: placeholder("Outlet") },
    { label: "Markaz Resale", href: placeholder("Markaz Resale") },
];

const DealsTabs = ({ active }: any) => {
    return (
        <nav aria-label="Deals sections" className="bg-white border-b border-slate-200">
            <ul className="max-w-[1500px] mx-auto px-4 flex items-center gap-6 overflow-x-auto scrollbar-hide whitespace-nowrap text-sm py-3">
                {tabs.map((tab) => (
                    <li key={tab.label}>
                        <Link
                            href={tab.href}
                            aria-current={active === tab.label ? "page" : undefined}
                            className={`hover:underline ${
                                active === tab.label ? "font-bold" : ""
                            }`}
                        >
                            {tab.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default DealsTabs;
