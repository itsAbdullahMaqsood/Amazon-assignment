import Link from "next/link";

import { Container, Notice, PageHeader } from "@/components/ui/Layout";

export const metadata = { title: "Markaz Business" };

// Markaz runs no business programme. The page says so and then says what a
// business buyer can do with the store as it is, which is more use than a list
// of features that do not exist.
const canDo = [
    {
        title: "Buy in whatever quantity is in stock",
        body: "Stock is per size and colour, and the cart is capped at what is really there. The same catalogue, the same prices, for everyone.",
    },
    {
        title: "Keep several delivery addresses",
        body: "Save an address per site or office and pick one at checkout. The address is copied onto the order, so editing the book later never rewrites an order already placed.",
        href: "/profile/address",
        label: "Your addresses",
    },
    {
        title: "Have every order in one place",
        body: "Orders keep their items, totals, delivery charges, coupon, payment method and return requests, and they never expire out of the list.",
        href: "/profile/orders",
        label: "Your orders",
    },
    {
        title: "Take your data out",
        body: "Everything on the account downloads as JSON — orders, addresses, cart, lists and browsing history — in one request, whenever you want it.",
        href: "/profile/data",
        label: "Privacy & data",
    },
];

const notHere = [
    ["Business-only pricing", "Every account sees the same price. There is no second price list behind a sign-in."],
    ["Multi-user accounts", "An account is one person. There are no groups, no buyers and no cost centres."],
    ["Approval workflows", "Nothing can be routed to an approver, because there is no second person on an account to route it to."],
    ["Spend analytics", "Your orders are the whole record. There are no dashboards and no CSV beyond the JSON export."],
    ["Tax exemption", "Markaz adds no tax at all, so there is nothing to be exempt from."],
    ["Shared payment methods and credit terms", "No payment details are collected anywhere in this store, so there is nothing to share or extend."],
    ["VAT invoices", "An order page is the receipt. No invoice document is generated."],
];

const Page = () => (
    <main className="pb-16">
        <Container className="max-w-3xl">
            <PageHeader
                title="Markaz Business"
                description="Markaz has one kind of account, and it is the one you already have."
            />

            <Notice tone="neutral" title="There is no separate business programme">
                Amazon Business is a real product with business pricing, multi-user accounts,
                approvals and tax exemption behind it. None of that is built here, so rather than
                describe it, this page is about what a business buyer can actually do with Markaz
                today — and what they cannot.
            </Notice>

            <section className="mt-10">
                <h2 className="font-display text-xl font-semibold tracking-tight text-fg">What works today</h2>

                <dl className="mt-4 divide-y divide-line border-y border-line">
                    {canDo.map((entry) => (
                        <div key={entry.title} className="py-4">
                            <dt className="font-medium text-fg">{entry.title}</dt>
                            <dd className="mt-1 text-sm text-fg-muted">
                                {entry.body}
                                {entry.href && (
                                    <>
                                        {" "}
                                        <Link href={entry.href} className="text-link">
                                            {entry.label}
                                        </Link>
                                        .
                                    </>
                                )}
                            </dd>
                        </div>
                    ))}
                </dl>
            </section>

            <section className="mt-10">
                <h2 className="font-display text-xl font-semibold tracking-tight text-fg">What isn&apos;t here</h2>

                <dl className="mt-4 divide-y divide-line border-y border-line">
                    {notHere.map(([title, body]) => (
                        <div key={title} className="py-3">
                            <dt className="text-sm font-medium text-fg">{title}</dt>
                            <dd className="mt-0.5 text-sm text-fg-muted">{body}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            <p className="mt-10 text-sm text-fg-muted">
                The one thing that does change what an account pays is{" "}
                <Link href="/plus" className="text-link">
                    Markaz Plus
                </Link>
                , which waives delivery charges, and it can be shared with up to four other people
                through your household.
            </p>
        </Container>
    </main>
);

export default Page;
