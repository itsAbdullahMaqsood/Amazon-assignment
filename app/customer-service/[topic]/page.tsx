import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import MenuSideBar from "@/components/Header/MenuSidebar";
import HelpfulVote from "@/components/customerService/HelpfulVote";
import { getTopic, helpTopics } from "@/lib/customerService";

export const generateMetadata = async ({ params }: any) => {
    const { topic } = await params;
    const article = getTopic(topic);

    return { title: article ? `${article.title} - Customer Service` : "Customer Service" };
};

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
        <>
            <Header title={article.title} />

            <main className="bg-white min-h-[60vh]">
                <div className="max-w-[1000px] mx-auto px-4 py-6">
                    <nav aria-label="Breadcrumb" className="flex items-center text-sm">
                        <Link
                            href="/customer-service"
                            className="text-[#0F5FA6] hover:text-[#C7511F] hover:underline"
                        >
                            Customer Service
                        </Link>
                        <ChevronRightIcon className="h-3 mx-1 text-slate-500" />
                        <span className="text-[#C7511F]">{article.title}</span>
                    </nav>

                    <div className="flex flex-col md:flex-row gap-10 mt-4">
                        <article className="grow min-w-0">
                            <h1 className="text-3xl font-bold">{article.title}</h1>
                            <p className="text-slate-700 mt-3">{article.intro}</p>

                            <div className="mt-6 space-y-6">
                                {article.sections.map((section: any) => (
                                    <section key={section.heading}>
                                        <h2 className="text-lg font-bold">{section.heading}</h2>

                                        {section.body.map((paragraph: string, i: number) => (
                                            <p key={i} className="text-sm text-slate-700 mt-2">
                                                {paragraph}
                                            </p>
                                        ))}
                                    </section>
                                ))}
                            </div>

                            {article.links?.length > 0 && (
                                <div className="flex flex-wrap gap-3 mt-8">
                                    {article.links.map((link: any) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="px-5 py-1.5 rounded-full text-sm border border-slate-400 bg-white hover:bg-slate-100 shadow-sm"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <HelpfulVote topic={article.title} />
                        </article>

                        <aside className="md:w-[260px] shrink-0">
                            <div className="border border-slate-300 rounded-lg bg-[#F7F8F8] p-4">
                                <h2 className="font-bold text-sm">Related topics</h2>

                                <ul className="mt-2 space-y-2">
                                    {related.map((entry: any) => (
                                        <li key={entry.slug}>
                                            <Link
                                                href={`/customer-service/${entry.slug}`}
                                                className="text-sm text-[#0F5FA6] hover:text-[#C7511F] hover:underline"
                                            >
                                                {entry.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href="/customer-service"
                                    className="block text-sm text-[#0F5FA6] hover:text-[#C7511F] hover:underline mt-4 pt-3 border-t border-slate-300"
                                >
                                    All help topics
                                </Link>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            <Footer />

            <MenuSideBar />
        </>
    );
};

export default Page;
