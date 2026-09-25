import Link from "next/link";
import Image from "next/image";

import { auth } from "@/auth";
import { getOrders } from "@/lib/orderQueries";
import { quickLinks, topicList } from "@/lib/customerService";
import { formatDate, orderNumber } from "@/lib/returns";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { money } from "@/components/ui/Price";
import { Container, PageHeader, SectionHeader } from "@/components/ui/Layout";
import StatusPill from "@/components/orders/StatusPill";
import BuyAgainButton from "@/components/orders/BuyAgainButton";
import HelpSearch from "@/components/customerService/HelpSearch";
import TopicTiles from "@/components/customerService/TopicTiles";
import ContactPanel from "@/components/customerService/ContactPanel";

export const metadata = { title: "Help" };

const Page = async () => {
    const session = await auth();
    const topics = topicList();

    // Most visits to a help centre are about one particular order, so the newest
    // one is pinned at the top with the things you can do to it.
    const latest = session ? (await getOrders(session.user.id, {})).orders[0] : null;
    const returnable = latest ? latest.lines.filter((line: any) => line.returns?.returnable) : [];

    return (
        <main className="pb-14">
            <Container className="max-w-4xl">
                <PageHeader
                    title="Help"
                    description="What this store does, in the store's own words. Every page here was written against the code rather than against a policy."
                />

                <HelpSearch topics={topics} />

                {latest && (
                    <section className="mt-8">
                        <SectionHeader
                            title="Your latest order"
                            action={
                                <Link href="/profile/orders" className="whitespace-nowrap text-link">
                                    All orders
                                </Link>
                            }
                        />

                        <Card>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm text-fg-muted">
                                        #{orderNumber(latest._id)} · placed {formatDate(latest.createdAt)} ·{" "}
                                        <span className="tabular">{money(latest.total)}</span>
                                    </p>
                                </div>
                                <StatusPill state={latest.state} />
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                {latest.lines.slice(0, 4).map((line: any, i: number) => (
                                    <span key={i} className="relative h-12 w-12 overflow-hidden rounded-control bg-surface-muted">
                                        {line.image && <Image src={line.image} alt="" fill sizes="48px" className="object-contain p-1" />}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <Button href={`/order/${latest._id}`} size="sm">
                                    View order
                                </Button>
                                {returnable.length > 0 && (
                                    <Button href={`/order/${latest._id}`} variant="outline" size="sm">
                                        Return an item
                                    </Button>
                                )}
                                <BuyAgainButton lines={latest.lines} />
                            </div>
                        </Card>
                    </section>
                )}

                <section className="mt-10">
                    <SectionHeader title="Help topics" />
                    <TopicTiles topics={topics} />
                </section>

                <section className="mt-10">
                    <SectionHeader title="Go straight there" />
                    <ul className="flex flex-wrap gap-2">
                        {quickLinks.map((link: any) => (
                            <li key={link.href + link.label}>
                                <Link
                                    href={link.href}
                                    className="inline-block rounded-full border border-line-strong bg-surface px-3.5 py-1.5 text-sm text-fg hover:border-fg-subtle"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>

                <div className="mt-10">
                    <ContactPanel />
                </div>
            </Container>
        </main>
    );
};

export default Page;
