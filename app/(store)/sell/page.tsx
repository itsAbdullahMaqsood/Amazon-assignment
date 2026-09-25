import Link from "next/link";

import Accordion from "@/components/shared/Accordion";
import FeeCalculator from "@/components/sell/FeeCalculator";
import { Plans, SellHero, Steps, Tools, faqs } from "@/components/sell/sections";

export const metadata = {
    title: "Start a Selling Account",
};

const Page = () => {
    return (
        <>

            <main className="bg-white">
                <SellHero />

                <Plans />

                <Steps />

                <section id="fee-calculator" className="bg-white border-b border-slate-200 scroll-mt-4">
                    <div className="max-w-[1500px] mx-auto px-4 py-10">
                        <h2 className="text-2xl md:text-3xl font-bold">Estimate your fees</h2>
                        <p className="text-slate-600 mt-2 mb-6">
                            Pick a category and a price to see what lands in your account after
                            Markaz&apos;s cut.
                        </p>

                        <FeeCalculator />
                    </div>
                </section>

                <Tools />

                <section className="bg-white">
                    <div className="max-w-3xl mx-auto px-4 py-10">
                        <h2 className="text-2xl md:text-3xl font-bold mb-6">
                            Frequently asked questions
                        </h2>

                        <Accordion items={faqs} />
                    </div>
                </section>

                <section className="bg-slate-100 border-t border-slate-200">
                    <div className="max-w-3xl mx-auto px-4 py-10 text-center">
                        <h2 className="text-2xl font-bold">Ready to list your first product?</h2>
                        <p className="text-slate-600 mt-2">
                            Registration takes about 15 minutes once your bank and tax details are to
                            hand.
                        </p>
                        <Link
                            href="/auth/register?seller=1"
                            className="inline-block mt-5 px-8 py-2.5 rounded-full bg-accent text-ink-900 font-medium"
                        >
                            Start a Selling Account
                        </Link>
                    </div>
                </section>
            </main>


        </>
    );
};

export default Page;
