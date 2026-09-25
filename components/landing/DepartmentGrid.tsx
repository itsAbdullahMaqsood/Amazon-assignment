import Link from "next/link";
import Image from "next/image";

import { SectionHeader } from "@/components/ui/Layout";

// Every department with its real product count and its best-rated product as
// the picture, so each card shows what is actually on the shelf.
const DepartmentGrid = ({ departments }: any) => (
    <section>
        <SectionHeader
            title="Shop by department"
            action={
                <Link href="/browse" className="text-link">
                    Browse everything
                </Link>
            }
        />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {departments.map((department: any) => (
                <li key={department.slug}>
                    <Link
                        href={department.href}
                        className="group flex items-center gap-3 rounded-card border border-line bg-surface p-2.5 transition hover:border-line-strong hover:shadow-card"
                    >
                        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-control bg-surface-muted">
                            {department.image && (
                                <Image src={department.image} alt="" fill sizes="56px" className="object-contain p-1.5 transition-transform group-hover:scale-110" />
                            )}
                        </span>
                        <span className="min-w-0">
                            <span className="block text-sm font-medium leading-snug text-fg line-clamp-2">{department.name}</span>
                            <span className="block text-xs text-fg-muted tabular">{department.count} products</span>
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    </section>
);

export default DepartmentGrid;
