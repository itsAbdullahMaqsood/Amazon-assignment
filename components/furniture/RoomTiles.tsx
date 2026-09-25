import Link from "next/link";
import Image from "next/image";

import { cn } from "@/components/ui/cn";

// One tile per room the catalogue actually fills, illustrated by a piece that is
// in it. Amazon's tiles are drawn for rooms it wishes it stocked; these cannot
// be, because the photo comes from the products behind the tile.
const RoomTiles = ({ rooms, active }: any) => {
    if (!rooms.length) {
        return null;
    }

    return (
        <nav aria-label="Rooms" className="scroll-row -mx-4 gap-4 px-4 sm:mx-0 sm:px-0 md:flex md:flex-wrap md:gap-x-6 md:gap-y-5 md:overflow-visible">
            {rooms.map((room: any) => {
                const current = active?.slug === room.slug;

                return (
                    <Link
                        key={room.slug}
                        href={current ? "/furniture" : `/furniture?room=${room.slug}`}
                        aria-current={current ? "page" : undefined}
                        className="w-24 shrink-0 text-center sm:w-28"
                    >
                        <span
                            className={cn(
                                "relative block aspect-square overflow-hidden rounded-full bg-surface-muted ring-1 transition-colors",
                                current ? "ring-2 ring-accent-ink" : "ring-line hover:ring-line-strong"
                            )}
                        >
                            {room.image && <Image src={room.image} alt="" fill sizes="112px" className="object-contain p-3" />}
                        </span>
                        <span className={cn("mt-2 block text-sm", current ? "font-semibold text-accent-deep" : "text-fg")}>
                            {room.name}
                        </span>
                        <span className="block text-xs text-fg-subtle tabular">{room.count}</span>
                    </Link>
                );
            })}
        </nav>
    );
};

export default RoomTiles;
