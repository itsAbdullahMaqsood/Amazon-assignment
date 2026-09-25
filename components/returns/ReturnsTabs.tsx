import Link from "next/link";

import { returnTabs } from "@/lib/returns";

const ReturnsTabs = ({ active }: any) => {
    return (
        <nav aria-label="Returns sections" className="border-b border-slate-300">
            <ul className="flex items-center gap-8 text-sm">
                {returnTabs.map((tab) => (
                    <li key={tab.value}>
                        <Link
                            href={tab.value ? `/profile/returns?tab=${tab.value}` : "/profile/returns"}
                            aria-current={active === tab.value ? "page" : undefined}
                            className={`block pb-2 -mb-px border-b-[3px] ${
                                active === tab.value
                                    ? "border-accent-deep font-bold text-black"
                                    : "border-transparent text-accent-ink hover:text-accent-deep hover:underline"
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

export default ReturnsTabs;
