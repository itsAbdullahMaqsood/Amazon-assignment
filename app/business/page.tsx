import Link from "next/link";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import MenuSideBar from "@/components/Header/MenuSidebar";
import Accordion from "@/components/shared/Accordion";
import BusinessHero from "@/components/business/BusinessHero";
import { Benefits, Comparison, HowItWorks, Quotes } from "@/components/business/sections";
import { faqs } from "@/lib/business";

export const metadata = {
    title: "Amazon Business",
};

const Page = () => {
    return (
        <>
            <Header title="Amazon Business" />

            <main className="bg-white">
                <BusinessHero />

                <HowItWorks />

                <Benefits />

                <Comparison />

                <Quotes />

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
                        <h2 className="text-2xl font-bold">Ready when you are</h2>
                        <p className="text-slate-600 mt-2">
                            Opening the account takes a few minutes and costs nothing.
                        </p>
                        <Link
                            href="/auth/register?business=1"
                            className="inline-block mt-5 px-8 py-2.5 rounded-full bg-linear-to-r from-amazon-orange to-yellow-300 text-amazon-blue_dark font-medium"
                        >
                            Create a free Amazon Business account
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />

            <MenuSideBar />
        </>
    );
};

export default Page;
