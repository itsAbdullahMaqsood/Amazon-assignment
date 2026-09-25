import Link from "next/link";

import { placeholder } from "@/components/profile/accountLinks";

export const registryLinks = [
    { label: "Find a registry or gift list", href: "/registry/find" },
    { label: "Create a registry or gift list", href: placeholder("Create a registry or gift list") },
    { label: "Help", href: placeholder("Registry help") },
];

const RegistryNav = ({ active = "" }: any) => (
    <nav aria-label="Registry and gifting" className="bg-white border-b border-slate-200">
        <div className="max-w-[1500px] mx-auto px-6 h-14 flex items-center gap-8 overflow-x-auto scrollbar-hide">
            <Link href="/registry" className="text-xl font-bold text-accent-ink whitespace-nowrap">
                registry &amp; gifting
            </Link>

            <ul className="flex items-center gap-8 text-[15px]">
                {registryLinks.map((link) => (
                    <li key={link.label}>
                        <Link
                            href={link.href}
                            aria-current={active === link.label ? "page" : undefined}
                            className={`whitespace-nowrap hover:underline ${
                                active === link.label ? "font-semibold" : ""
                            }`}
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    </nav>
);

export default RegistryNav;
