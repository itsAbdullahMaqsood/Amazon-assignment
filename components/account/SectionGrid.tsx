import Link from "next/link";

import { accountSections } from "./sections";

// Every account section on one page, with a live count where the account holds
// one. It is the same list as the rail: on a phone, where the rail is behind a
// button, this is the map.
const SectionGrid = ({ counts = {} }: any) => (
    <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {accountSections.map((section) => (
            <div key={section.heading}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">{section.heading}</h3>

                <ul className="mt-2 divide-y divide-line border-t border-line">
                    {section.links.map((link: any) => (
                        <li key={link.href}>
                            <Link href={link.href} className="group flex items-baseline justify-between gap-3 py-2.5">
                                <span className="min-w-0">
                                    <span className="block text-sm font-medium text-fg group-hover:text-accent-deep group-hover:underline underline-offset-2">
                                        {link.label}
                                    </span>
                                    <span className="block text-xs text-fg-muted">{link.description}</span>
                                </span>
                                {counts[link.href] !== undefined && (
                                    <span className="shrink-0 text-sm tabular text-fg-muted">{counts[link.href]}</span>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        ))}
    </div>
);

export default SectionGrid;
