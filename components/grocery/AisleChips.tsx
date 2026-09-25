import Link from "next/link";

import { cn } from "@/components/ui/cn";

const chip = (active: boolean) =>
    cn(
        "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm",
        active ? "border-accent-ink bg-accent-soft text-accent-ink" : "border-line-strong bg-surface text-fg hover:border-fg-subtle"
    );

// The aisles the catalogue actually stocks, with what is in each. A department
// the shop does not carry is never offered.
const AisleChips = ({ aisles, active, deals, dealCount, total }: any) => (
    <nav aria-label="Aisles" className="scroll-row -mx-4 gap-2 px-4 sm:mx-0 sm:px-0">
        <Link href="/groceries" aria-current={!active && !deals ? "page" : undefined} className={chip(!active && !deals)}>
            Everything <span className="ml-1 text-xs tabular opacity-70">{total}</span>
        </Link>

        {dealCount > 0 && (
            <Link href="/groceries?deals=1" aria-current={deals ? "page" : undefined} className={chip(!!deals)}>
                On sale <span className="ml-1 text-xs tabular opacity-70">{dealCount}</span>
            </Link>
        )}

        {aisles.map((aisle: any) => (
            <Link
                key={aisle.slug}
                href={`/groceries?aisle=${aisle.slug}`}
                aria-current={active?.slug === aisle.slug ? "page" : undefined}
                className={chip(active?.slug === aisle.slug)}
            >
                {aisle.name} <span className="ml-1 text-xs tabular opacity-70">{aisle.count}</span>
            </Link>
        ))}
    </nav>
);

export default AisleChips;
