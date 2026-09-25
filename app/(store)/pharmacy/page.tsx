import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import { hasPlusDelivery } from "@/lib/plusAccess";
import { PLUS_DISCOUNT, commonMedications, medicationCount, searchMedications } from "@/lib/pharmacy";
import { Container, EmptyState, Notice, PageHeader } from "@/components/ui/Layout";
import MedicationSearch from "@/components/pharmacy/MedicationSearch";
import MedicationCard from "@/components/pharmacy/MedicationCard";

export const metadata = { title: "Markaz Pharmacy" };

const Page = async ({ searchParams }: any) => {
    const [session, query] = await Promise.all([auth(), searchParams]);
    const term = String((query || {}).q || "").trim().slice(0, 60);

    let member = false;

    if (session) {
        await connectDb();
        const user: any = await User.findById(session.user.id).select("membership email").lean();
        member = (await hasPlusDelivery(user)).plus;
    }

    const [results, common, total] = await Promise.all([
        term ? searchMedications(term) : Promise.resolve([]),
        term ? Promise.resolve([]) : commonMedications(),
        medicationCount(),
    ]);

    return (
        <main className="pb-16">
            <Container className="max-w-4xl">
                <PageHeader
                    title="Markaz Pharmacy"
                    description="Look up a medication and see what it would cost, with the label facts the FDA publishes about it."
                />

                <MedicationSearch term={term} />

                <Notice tone="neutral" title="What this is, and what it isn't" className="mt-6">
                    <p>
                        Markaz does not dispense medication. There is no prescription to upload, nothing to deliver and
                        no pharmacist behind this page — it is a price look-up over {total} drug labels from the public{" "}
                        <a
                            href="https://open.fda.gov/apis/drug/label/"
                            target="_blank"
                            rel="noreferrer"
                            className="text-link"
                        >
                            openFDA
                        </a>{" "}
                        database.
                    </p>
                    <p className="mt-2">
                        openFDA publishes labels, not prices, so the two figures on each result are generated from the
                        label&apos;s own id. They are stable — the same medication always quotes the same price — and
                        they are illustrative. The Plus price is {PLUS_DISCOUNT}% off the cash price, and{" "}
                        <Link href="/plus" className="text-link">
                            a membership
                        </Link>{" "}
                        is what decides which one you are shown.
                    </p>
                </Notice>

                {term ? (
                    <section className="mt-8">
                        <h2 className="font-display text-xl font-semibold tracking-tight text-fg">
                            {results.length} result{results.length === 1 ? "" : "s"} for “{term}”
                        </h2>

                        {results.length === 0 ? (
                            <EmptyState
                                className="mt-4"
                                icon={MagnifyingGlassIcon}
                                title="No label matched that"
                                description="Try the generic name or the active ingredient — a brand is only on the label of the company that sells it."
                            />
                        ) : (
                            <ul className="mt-4 space-y-4">
                                {results.map((medication: any) => (
                                    <li key={medication._id}>
                                        <MedicationCard medication={medication} member={member} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                ) : (
                    <section className="mt-8">
                        <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Something to start with</h2>
                        <p className="mt-0.5 text-sm text-fg-muted">A few of the {total} labels Markaz holds.</p>

                        <ul className="mt-4 flex flex-wrap gap-2">
                            {common.map((medication: any) => (
                                <li key={medication._id}>
                                    <Link
                                        href={`/pharmacy?q=${encodeURIComponent(medication.brandName)}`}
                                        className="inline-block rounded-full border border-line-strong bg-surface px-3.5 py-1.5 text-sm text-fg hover:border-fg-subtle"
                                    >
                                        {medication.brandName}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </Container>
        </main>
    );
};

export default Page;
