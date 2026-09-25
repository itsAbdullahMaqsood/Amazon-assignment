import Link from "next/link";
import { redirect } from "next/navigation";
import { TruckIcon, BeakerIcon } from "@heroicons/react/24/outline";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import { benefits, membershipState, notClaimed, plans } from "@/lib/membership";
import { money } from "@/components/ui/Price";
import Button from "@/components/ui/Button";
import { Container } from "@/components/ui/Layout";
import MembershipPanel from "@/components/plus/MembershipPanel";

export const metadata = { title: "Markaz Plus" };

const icons = [TruckIcon, BeakerIcon];

const Page = async () => {
    const session = await auth();

    let membership: any = membershipState(null);

    if (session) {
        await connectDb();
        const user: any = await User.findById(session.user.id).select("membership").lean();
        membership = membershipState(user?.membership);
    }

    return (
        <main className="pb-16">
            <section className="bg-ink-900 text-fg-inverse">
                <Container className="max-w-5xl py-12 md:py-16">
                    <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
                        <div>
                            <p className="font-display text-sm font-medium uppercase tracking-wide text-accent">Markaz Plus</p>
                            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">
                                Delivery, on us.
                            </h1>
                            <p className="mt-4 max-w-prose text-fg-inverse-muted">
                                Markaz charges delivery per item. A Plus membership waives every one of those charges, and
                                the pharmacy shows you its Plus price. That is what it does — and the total at checkout is
                                recomputed on the server, so it is the price you pay rather than a badge on a page.
                            </p>

                            <dl className="mt-8 grid gap-6 sm:grid-cols-2">
                                {benefits.map((benefit: any, i: number) => {
                                    const Icon = icons[i] || TruckIcon;

                                    return (
                                        <div key={benefit.title}>
                                            <dt className="flex items-center gap-2 font-medium">
                                                <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
                                                {benefit.title}
                                            </dt>
                                            <dd className="mt-1.5 text-sm text-fg-inverse-muted">
                                                {benefit.body}
                                                {benefit.href && (
                                                    <>
                                                        {" "}
                                                        <Link href={benefit.href} className="text-accent underline underline-offset-2">
                                                            Have a look
                                                        </Link>
                                                        .
                                                    </>
                                                )}
                                            </dd>
                                        </div>
                                    );
                                })}
                            </dl>

                            <p className="mt-6 max-w-prose text-sm text-fg-inverse-muted">{notClaimed}</p>
                        </div>

                        <div className="text-fg">
                            {session ? (
                                <MembershipPanel membership={JSON.parse(JSON.stringify(membership))} />
                            ) : (
                                <div className="rounded-panel border border-line bg-surface p-5 md:p-6">
                                    <h2 className="font-display text-xl font-semibold">Start with 30 days free</h2>
                                    <ul className="mt-3 space-y-1 text-sm text-fg-muted">
                                        {plans.map((plan) => (
                                            <li key={plan.id}>
                                                <span className="font-medium text-fg">{plan.name}</span> · {money(plan.price)}{" "}
                                                {plan.cadence}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button href="/auth/signin?callbackUrl=/plus" className="mt-4" block>
                                        Sign in to join
                                    </Button>
                                    <p className="mt-2 text-xs text-fg-muted">
                                        A membership belongs to an account, because checkout has to read it.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </Container>
            </section>

            <Container className="max-w-5xl">
                <section className="py-10">
                    <h2 className="font-display text-xl font-semibold tracking-tight">What it costs</h2>

                    <table className="mt-4 w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-line text-left text-fg-muted">
                                <th scope="col" className="py-2 font-medium">Plan</th>
                                <th scope="col" className="py-2 font-medium">Price</th>
                                <th scope="col" className="py-2 font-medium">Works out at</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map((plan) => (
                                <tr key={plan.id} className="border-b border-line">
                                    <th scope="row" className="py-3 text-left font-medium text-fg">{plan.name}</th>
                                    <td className="py-3 tabular">{money(plan.price)} {plan.cadence}</td>
                                    <td className="py-3 text-fg-muted">{plan.summary}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <p className="mt-4 max-w-prose text-sm text-fg-muted">
                        Both plans open with a 30-day free trial, and cancelling takes effect immediately. No payment is
                        taken at any point in this build — the plan and its dates are recorded on your account so the
                        store behaves as if you were billed, and the delivery waiver is real.
                    </p>
                </section>
            </Container>
        </main>
    );
};

export default Page;
