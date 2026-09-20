"use client";

import useBrowseQuery from "@/components/browse/useBrowseQuery";
import { keepShoppingTabs } from "./filters";

// The tabs are query state, not routes: switching one re-runs the same page
// query with a different sort.
const KeepShoppingTabs = ({ active }: any) => {
    const { filter } = useBrowseQuery();

    return (
        <nav aria-label="Recommendation sections" className="border-b border-slate-300">
            <ul className="flex items-center gap-8 text-lg">
                {keepShoppingTabs.map((tab) => (
                    <li key={tab.value}>
                        <button
                            onClick={() => filter({ tab: tab.value })}
                            aria-current={active === tab.value ? "page" : undefined}
                            className={`block py-3 -mb-px border-b-[3px] cursor-pointer ${
                                active === tab.value
                                    ? "border-[#007185] text-[#007185] font-bold"
                                    : "border-transparent hover:text-[#C7511F]"
                            }`}
                        >
                            {tab.label}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default KeepShoppingTabs;
