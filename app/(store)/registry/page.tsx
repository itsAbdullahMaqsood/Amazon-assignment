import Link from "next/link";

import { auth } from "@/auth";
import { searchLists } from "@/lib/listQueries";
import { Container, PageHeader } from "@/components/ui/Layout";
import RegistryFind from "@/components/registry/RegistryFind";

export const metadata = { title: "Find a list or registry" };

// A registry here is a list its owner made public. There is no separate registry
// object, and the page says so rather than implying a second product.
const Page = async ({ searchParams }: any) => {
    const [session, query] = await Promise.all([auth(), searchParams]);
    const term = String((query || {}).name || "").trim().slice(0, 60);
    const results = await searchLists(term);

    return (
        <main className="pb-14">
            <Container className="max-w-3xl">
                <PageHeader
                    title="Find a list or registry"
                    description="Search by the name of the person who made it, or by the name of the list. Only lists their owner made public can be found this way — a shared list opens from its link."
                />

                <RegistryFind term={term} results={results} />

                <section className="mt-12 border-t border-line pt-6">
                    <h2 className="font-display text-lg font-semibold text-fg">Making one of your own</h2>
                    <p className="mt-1 max-w-prose text-sm text-fg-muted">
                        A registry on Markaz is a list: name it, add what you want, and choose whether it is private,
                        shared by link, or public so guests can search for it. Nothing is reserved and nothing is
                        posted to you automatically — people buy from it the ordinary way, and can mark a gift as
                        bought so two of them don&apos;t buy the same thing.
                    </p>
                    <p className="mt-4 text-sm">
                        <Link href={session ? "/lists?new=1" : "/auth/signin?callbackUrl=/lists"} className="text-link">
                            Create a list
                        </Link>
                    </p>
                </section>
            </Container>
        </main>
    );
};

export default Page;
