import { ArrowRightIcon, MapIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

import { Container, EmptyState } from "@/components/ui/Layout";
import Button from "@/components/ui/Button";
import { accountSections } from "@/components/account/sections";

export const metadata = { title: "Nothing here" };

// This page used to be the destination for 56 account links that had no screen
// behind them. Every one of those links is now either a real page or gone, so
// nothing in the store points here any more; the URL stays for bookmarks and
// says plainly that whatever it named has been dealt with.
const Page = async ({ searchParams }: any) => {
    const title = String((await searchParams)?.title || "").trim();

    return (
        <main className="pb-14">
            <Container className="max-w-3xl">
                <EmptyState
                    className="mt-10"
                    icon={MapIcon}
                    title={title ? `“${title}” isn't a page any more` : "There's nothing at this address"}
                    description="Markaz used to send links with nothing behind them here. They have all been built or removed, so this page is only reached by an old bookmark."
                    action={<Button href="/profile">Your account</Button>}
                />

                <section className="mt-10">
                    <h2 className="font-display text-lg font-semibold text-fg">Everything the account holds</h2>

                    <ul className="mt-3 grid gap-x-8 gap-y-1 sm:grid-cols-2">
                        {accountSections
                            .flatMap((section: any) => section.links)
                            .map((link: any) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="group flex items-center gap-1.5 py-1.5 text-sm text-link">
                                        {link.label}
                                        <ArrowRightIcon className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                                    </Link>
                                </li>
                            ))}
                    </ul>
                </section>
            </Container>
        </main>
    );
};

export default Page;
