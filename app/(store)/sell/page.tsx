import Link from "next/link";

import FeeCalculator from "@/components/sell/FeeCalculator";
import { Container, Notice, PageHeader } from "@/components/ui/Layout";
import { INDIVIDUAL_PER_ITEM, PROFESSIONAL_MONTHLY, money, planBreakEvenUnits } from "@/lib/sellerFees";

export const metadata = { title: "Sell on Markaz" };

// Markaz has no sellers: one catalogue, seeded and administered in one place.
// What this page keeps is the fee arithmetic, which is worth having as a worked
// example even when nobody can sign up to pay it.
const Page = () => (
    <main className="pb-16">
        <Container className="max-w-4xl">
            <PageHeader
                title="Sell on Markaz"
                description="What a marketplace takes, worked out properly — on a store that has no marketplace."
            />

            <Notice tone="neutral" title="Markaz has no sellers">
                There is one catalogue here, seeded from public data and managed in a single admin
                area, so there is no seller account to open and no listing to create. The fee
                calculator below is kept because the arithmetic is the interesting part: it follows{" "}
                <a
                    href="https://sell.amazon.com/pricing"
                    target="_blank"
                    rel="noreferrer"
                    className="text-link"
                >
                    Amazon&apos;s published US fee schedule
                </a>{" "}
                closely enough to show how the money divides. It is reference data for a coursework
                project, not a quote from anybody.
            </Notice>

            <section className="mt-10">
                <h2 className="font-display text-xl font-semibold tracking-tight text-fg">The two plans</h2>
                <p className="mt-1 text-sm text-fg-muted">
                    A marketplace usually charges one of two ways: a monthly subscription, or a fee on every item
                    sold. Both are in the calculator.
                </p>

                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-card border border-line bg-surface p-4">
                        <dt className="font-medium text-fg">Professional</dt>
                        <dd className="mt-1 font-display text-xl font-semibold tabular text-fg">
                            {money(PROFESSIONAL_MONTHLY)}
                            <span className="text-sm font-normal text-fg-muted"> a month</span>
                        </dd>
                        <dd className="mt-1 text-sm text-fg-muted">No per-item fee on top of the referral fee.</dd>
                    </div>
                    <div className="rounded-card border border-line bg-surface p-4">
                        <dt className="font-medium text-fg">Individual</dt>
                        <dd className="mt-1 font-display text-xl font-semibold tabular text-fg">
                            {money(INDIVIDUAL_PER_ITEM)}
                            <span className="text-sm font-normal text-fg-muted"> an item</span>
                        </dd>
                        <dd className="mt-1 text-sm text-fg-muted">No subscription, charged only when something sells.</dd>
                    </div>
                </dl>

                <p className="mt-3 text-sm text-fg-muted">
                    The two cross over at {planBreakEvenUnits} items a month: below that the per-item fee is cheaper,
                    above it the subscription is.
                </p>
            </section>

            <section className="mt-10">
                <h2 className="font-display text-xl font-semibold tracking-tight text-fg">What would land in your account</h2>
                <p className="mb-6 mt-1 text-sm text-fg-muted">
                    Pick a category and a price. The referral fee is tiered — some categories split the price across
                    bands, others pick one rate for the whole price — and the calculator shows which of the two it
                    used.
                </p>

                <FeeCalculator />
            </section>

            <p className="mt-10 text-sm text-fg-muted">
                Everything on sale here is administered from the{" "}
                <Link href="/admin/dashboard" className="text-link">
                    admin area
                </Link>
                , which is how a product, a category or a coupon actually gets into this store.
            </p>
        </Container>
    </main>
);

export default Page;
