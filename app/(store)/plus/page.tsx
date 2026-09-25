import Link from "next/link";

import { auth } from "@/auth";
import { deliveryTruth, faqs } from "@/lib/prime";
import Accordion from "@/components/shared/Accordion";
import BenefitTiles from "@/components/prime/BenefitTiles";
import MembershipPanel from "@/components/prime/MembershipPanel";
import PlanTable from "@/components/prime/PlanTable";

export const metadata = {
    title: "Markaz Plus",
};

// Public: a signed-out visitor gets the marketing page and a sign-in CTA, a
// signed-in one gets the membership panel in place of the join button.
const Page = async () => {
    const session = await auth();
    const signedIn = Boolean(session);

    return (
        <>

            <main className="bg-white">
                <section className="bg-linear-to-r from-ink-900 to-ink-800 text-white">
                    <div className="max-w-[1180px] mx-auto px-4 py-14 grid lg:grid-cols-2 gap-10 items-center">
                        <div>
                            <p className="text-3xl font-bold lowercase tracking-tight text-accent">
                                markaz plus
                            </p>
                            <h1 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">
                                One membership, every part of Markaz
                            </h1>
                            <p className="mt-4 text-white/80 max-w-xl">
                                Delivery, Markaz Movies, member-only deals, reading, photo storage and
                                gaming — bundled into a single plan, free for the first 30 days.
                            </p>

                            <ul className="mt-6 space-y-2 text-sm text-white/80">
                                <li>Cancel any time during the trial and pay nothing.</li>
                                <li>Plans from $7.49 a month for students.</li>
                                <li>
                                    Already watching?{" "}
                                    <Link href="/movies" className="underline">
                                        Open Markaz Movies
                                    </Link>
                                    .
                                </li>
                            </ul>
                        </div>

                        <div className="lg:justify-self-end w-full">
                            <MembershipPanel signedIn={signedIn} tone="dark" />
                        </div>
                    </div>
                </section>

                <section className="max-w-[1180px] mx-auto px-4 py-12">
                    <h2 className="text-2xl md:text-3xl font-bold">What is included with Plus</h2>
                    <p className="mt-2 text-slate-600">
                        Six benefits, all of them part of every plan below.
                    </p>

                    <div className="mt-6">
                        <BenefitTiles />
                    </div>

                    <div className="mt-8 border border-slate-300 rounded-lg bg-surface-muted p-6">
                        <h3 className="font-bold">How delivery is actually priced here</h3>
                        <p className="mt-2 text-sm text-slate-700">{deliveryTruth}</p>
                        <Link
                            href="/cart"
                            className="inline-block mt-3 text-sm text-accent-ink hover:text-accent-deep hover:underline"
                        >
                            See the fees on your cart
                        </Link>
                    </div>
                </section>

                <section className="bg-surface-muted border-y border-slate-200">
                    <div className="max-w-[1180px] mx-auto px-4 py-12">
                        <h2 className="text-2xl md:text-3xl font-bold">Choose your plan</h2>
                        <p className="mt-2 text-slate-600">
                            Every plan starts with the same 30-day free trial.
                        </p>

                        <div className="mt-6">
                            <PlanTable signedIn={signedIn} />
                        </div>
                    </div>
                </section>

                <section className="max-w-[900px] mx-auto px-4 py-12">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6">Frequently asked questions</h2>
                    <Accordion items={faqs} />

                    <p className="mt-6 text-sm text-slate-600">
                        Managing an existing membership?{" "}
                        <Link
                            href="/profile/memberships"
                            className="text-accent-ink underline hover:text-accent-deep"
                        >
                            Memberships and subscriptions
                        </Link>{" "}
                        lists everything on your account.
                    </p>
                </section>
            </main>


        </>
    );
};

export default Page;
