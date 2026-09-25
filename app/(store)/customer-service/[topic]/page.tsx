import Link from "next/link";
import { notFound } from "next/navigation";

import { getTopic, helpTopics, topicOrder } from "@/lib/customerService";
import { Breadcrumbs, Container } from "@/components/ui/Layout";
import HelpfulVote from "@/components/customerService/HelpfulVote";

export const generateMetadata = async ({ params }: any) => {
    const article = getTopic((await params).topic);

    return { title: article ? article.title : "Help" };
};

export const generateStaticParams = async () => topicOrder.map((topic: string) => ({ topic }));

const Page = async ({ params }: any) => {
    const { topic } = await params;
    const article = getTopic(topic);

    if (!article) {
        notFound();
    }

    const related = (article.related || [])
        .filter((slug: string) => helpTopics[slug])
        .map((slug: string) => ({ slug, title: helpTopics[slug].title }));

    return (
        <main className="pb-14">
            <Container className="max-w-4xl">
                <Breadcrumbs
                    className="pt-6"
                    items={[{ label: "Help", href: "/customer-service" }, { label: article.title }]}
                />

                <div className="mt-4 gap-10 lg:flex">
                    <article className="min-w-0 flex-1">
                        <h1 className="font-display text-2xl font-semibold tracking-tight text-fg md:text-3xl">
                            {article.title}
                        </h1>
                        <p className="mt-3 text-lg leading-relaxed text-fg-muted">{article.intro}</p>

                        <div className="mt-8 space-y-7">
                            {article.sections.map((section: any) => (
                                <section key={section.heading}>
                                    <h2 className="font-display text-lg font-semibold text-fg">{section.heading}</h2>

                                    {section.body.map((paragraph: string, i: number) => (
                                        <p key={i} className="mt-2 leading-relaxed text-fg-muted">
                                            {paragraph}
                                        </p>
                                    ))}
                                </section>
                            ))}
                        </div>

                        {article.links?.length > 0 && (
                            <div className="mt-8 flex flex-wrap gap-2">
                                {article.links.map((link: any) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="inline-block rounded-full border border-line-strong bg-surface px-3.5 py-1.5 text-sm text-fg hover:border-fg-subtle"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}

                        <HelpfulVote topic={article.title} />
                    </article>

                    <aside className="mt-10 shrink-0 lg:mt-0 lg:w-56">
                        <div className="rounded-card border border-line bg-surface p-4">
                            <h2 className="text-sm font-semibold text-fg">Related</h2>

                            <ul className="mt-2 space-y-2 text-sm">
                                {related.map((entry: any) => (
                                    <li key={entry.slug}>
                                        <Link href={`/customer-service/${entry.slug}`} className="text-link">
                                            {entry.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/customer-service"
                                className="mt-4 block border-t border-line pt-3 text-sm text-link"
                            >
                                All help topics
                            </Link>
                        </div>
                    </aside>
                </div>
            </Container>
        </main>
    );
};

export default Page;
