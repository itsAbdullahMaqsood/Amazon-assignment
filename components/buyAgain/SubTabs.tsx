import Link from "next/link";

import { placeholder } from "@/components/profile/accountLinks";

const tabs = [
    { label: "Buy Again", href: "/buy-again" },
    { label: "Subscribe & Save", href: placeholder("Subscribe & Save") },
];

const SubTabs = ({ active }: any) => {
    return (
        <nav aria-label="Buy Again sections" className="border-b border-slate-200">
            <ul className="max-w-[1500px] mx-auto px-6 flex items-center gap-8 text-sm">
                {tabs.map((tab) => (
                    <li key={tab.label}>
                        <Link
                            href={tab.href}
                            aria-current={active === tab.label ? "page" : undefined}
                            className={`block py-4 border-b-2 ${
                                active === tab.label
                                    ? "border-accent-ink text-accent-ink font-semibold"
                                    : "border-transparent hover:text-accent-ink"
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

export default SubTabs;
