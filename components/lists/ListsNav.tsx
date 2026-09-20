import Link from "next/link";

import { placeholder } from "@/components/profile/accountLinks";

const tabs = [
    { label: "Your Lists", href: "/lists/create" },
    { label: "Gift Finder", href: placeholder("Gift Finder") },
    { label: "Baby Registry", href: placeholder("Baby Registry") },
    { label: "Birthday Gift List", href: placeholder("Birthday Gift List") },
    { label: "Wedding Registry", href: placeholder("Wedding Registry") },
    { label: "Amazon Gift Cards", href: placeholder("Amazon Gift Cards") },
    { label: "Custom Gift List", href: placeholder("Custom Gift List") },
    { label: "Lists Help", href: placeholder("Lists Help") },
];

const ListsNav = ({ active }: any) => {
    return (
        <nav aria-label="Lists and registries" className="bg-white border-b border-slate-200">
            <ul className="max-w-[1500px] mx-auto px-4 flex items-center gap-6 overflow-x-auto scrollbar-hide whitespace-nowrap text-sm py-3">
                {tabs.map((tab) => (
                    <li key={tab.label}>
                        <Link
                            href={tab.href}
                            aria-current={active === tab.label ? "page" : undefined}
                            className={`hover:underline ${active === tab.label ? "font-bold" : ""}`}
                        >
                            {tab.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default ListsNav;
