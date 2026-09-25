import Link from "next/link";

import { tabs } from "@/lib/orders";
import { placeholder } from "@/components/profile/accountLinks";

// Two of the tabs leave this page: "Buy Again" has its own screen, and
// "Amazon Pay" is not part of this build.
const href = (value: string, params: string) => {
    if (value === "buy-again") return "/buy-again";
    if (value === "amazon-pay") return placeholder("Markaz Pay");

    const query = new URLSearchParams(params);

    if (value) {
        query.set("tab", value);
    } else {
        query.delete("tab");
    }

    const search = query.toString();

    return search ? `/profile/orders?${search}` : "/profile/orders";
};

const OrderTabs = ({ active, params }: any) => {
    return (
        <nav aria-label="Order sections" className="border-b border-slate-300">
            <ul className="flex items-center gap-8 text-sm">
                {tabs.map((tab) => (
                    <li key={tab.value}>
                        <Link
                            href={href(tab.value, params)}
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

export default OrderTabs;
