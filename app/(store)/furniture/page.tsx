import Link from "next/link";
import { HomeModernIcon } from "@heroicons/react/24/outline";

import { getHome } from "@/lib/furniture";
import ProductCard from "@/components/product/ProductCard";
import Button from "@/components/ui/Button";
import { Container, EmptyState, PageHeader, SectionHeader } from "@/components/ui/Layout";
import { cn } from "@/components/ui/cn";
import RoomTiles from "@/components/furniture/RoomTiles";

export const metadata = { title: "Markaz Home" };

const chip = (active: boolean) =>
    cn(
        "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm",
        active ? "border-accent-ink bg-accent-soft text-accent-ink" : "border-line-strong bg-surface text-fg hover:border-fg-subtle"
    );

const Page = async ({ searchParams }: any) => {
    const query = (await searchParams) || {};
    const data = await getHome({
        room: String(query.room || ""),
        style: String(query.style || ""),
        deals: query.deals === "1",
    });

    if (!data || data.total === 0) {
        return (
            <main className="pb-14">
                <Container className="max-w-3xl">
                    <PageHeader title="Markaz Home" />
                    <EmptyState
                        icon={HomeModernIcon}
                        title="Nothing in this department yet"
                        description="The home catalogue is seeded separately: run npm run seed:furniture."
                        action={<Button href="/browse">Browse the rest of the store</Button>}
                    />
                </Container>
            </main>
        );
    }

    const { rooms, styles, room, style, deals, dealCount, products, total, department } = data;
    const params = (next: any) =>
        new URLSearchParams({
            ...(room && { room: room.slug }),
            ...(style && { style: style.slug }),
            ...(deals && { deals: "1" }),
            ...next,
        }).toString();

    return (
        <main className="pb-14">
            <Container>
                <PageHeader
                    title="Markaz Home"
                    description={`Everything in ${department.name}, arranged the way you furnish a place: by the room it goes in, and the look you are after.`}
                />

                <RoomTiles rooms={rooms} active={room} />

                <div className="mt-10">
                    <SectionHeader
                        title={room ? `${room.name}${style ? ` · ${style.name}` : ""}` : style ? style.name : "Everything in Home"}
                        description={`${products.length} piece${products.length === 1 ? "" : "s"}`}
                        action={
                            <Link href={`/browse?category=${department.slug}`} className="whitespace-nowrap text-link">
                                Browse with every filter
                            </Link>
                        }
                    />

                    {(styles.length > 1 || dealCount > 0) && (
                        <nav aria-label="Styles" className="scroll-row -mx-4 mb-6 gap-2 px-4 sm:mx-0 sm:px-0">
                            {dealCount > 0 && (
                                <Link
                                    href={`/furniture?${params({ deals: deals ? "" : "1" })}`}
                                    aria-current={deals ? "page" : undefined}
                                    className={chip(deals)}
                                >
                                    On sale <span className="ml-1 text-xs tabular opacity-70">{dealCount}</span>
                                </Link>
                            )}

                            {styles.map((entry: any) => {
                                const current = style?.slug === entry.slug;

                                return (
                                    <Link
                                        key={entry.slug}
                                        href={`/furniture?${params({ style: current ? "" : entry.slug })}`}
                                        aria-current={current ? "page" : undefined}
                                        className={chip(current)}
                                    >
                                        {entry.name} <span className="ml-1 text-xs tabular opacity-70">{entry.count}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    )}

                    {products.length === 0 ? (
                        <EmptyState
                            icon={HomeModernIcon}
                            title="Nothing matches that combination"
                            description="Try another style, or look at the whole room."
                            action={<Button href="/furniture">Show everything</Button>}
                        />
                    ) : (
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {products.map((product: any, i: number) => (
                                <li key={product._id}>
                                    <ProductCard product={product} priority={i < 5} />
                                </li>
                            ))}
                        </ul>
                    )}

                    <p className="mt-8 text-sm text-fg-muted">
                        Showing {products.length} of {total} in {department.name}.{" "}
                        {(room || style || deals) && (
                            <Link href="/furniture" className="text-link">
                                Clear the filters
                            </Link>
                        )}
                    </p>
                </div>
            </Container>
        </main>
    );
};

export default Page;
