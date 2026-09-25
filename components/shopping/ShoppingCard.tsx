"use client";

import Link from "next/link";
import Image from "next/image";

import Price from "@/components/ui/Price";
import Badge from "@/components/ui/Badge";
import { cn } from "@/components/ui/cn";

// One card for both "things you have bought" and "things you have looked at".
// Image, name, a line saying why it is on this page, the price as it is today,
// and one action. The two pages differ in their note and their action, not in
// how a row reads.
const ShoppingCard = ({ item, href, note, action, aside, className = "" }: any) => (
    <article className={cn("flex gap-4 rounded-card border border-line bg-surface p-4", className)}>
        <Link href={href} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-control bg-surface-muted">
            {item.image && <Image src={item.image} alt="" fill sizes="96px" className="object-contain p-1.5" />}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-3">
                <Link href={href} className="line-clamp-2 text-sm font-medium text-fg hover:underline underline-offset-2">
                    {item.name}
                </Link>
                {aside}
            </div>

            {note && <p className="mt-0.5 text-xs text-fg-muted">{note}</p>}

            <div className="mt-1.5 flex items-center gap-2">
                {item.price === null ? (
                    <span className="text-sm text-fg-muted">No longer sold</span>
                ) : (
                    <Price value={item.price} listPrice={item.listPrice} size="sm" showSaving={false} />
                )}
                {item.price !== null && !item.inStock && <Badge tone="neutral">Out of stock</Badge>}
            </div>

            {action && <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 text-sm">{action}</div>}
        </div>
    </article>
);

export default ShoppingCard;
