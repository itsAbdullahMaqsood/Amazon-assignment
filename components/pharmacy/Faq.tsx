"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const faqs = [
    {
        question: "Do you take my insurance?",
        answer: "Amazon Pharmacy accepts most insurance plans. Add your plan details to your account and your copay is calculated automatically at checkout.",
    },
    {
        question: "How do I check my medication price?",
        answer: "Search for your medication above. Prices shown include the cash price and, where the medication qualifies, the Prime member price.",
    },
    {
        question: "How do I transfer or add a prescription to Amazon Pharmacy?",
        answer: "Sign up, then tell us the medication and your current pharmacy. We contact them and handle the transfer for you.",
    },
    {
        question: "What information do I need to give my prescriber?",
        answer: "Ask them to send your prescription to Amazon Pharmacy Home Delivery, 4500 S Pleasant Valley Road, Suite 201, Austin, TX 78744-2911.",
    },
    {
        question: "Where does Amazon Pharmacy deliver and how fast?",
        answer: "We deliver to most U.S. addresses, with free standard delivery for Prime members and status updates along the way.",
    },
];

const Faq = () => {
    const [open, setOpen] = useState<number>(-1);

    return (
        <section className="max-w-[1100px] mx-auto px-6 py-16">
            <h2 className="text-4xl font-bold mb-8">You may be wondering</h2>

            <div className="border-t border-slate-200">
                {faqs.map((faq, i) => (
                    <div key={faq.question} className="border-b border-slate-200">
                        <button
                            onClick={() => setOpen(open === i ? -1 : i)}
                            aria-expanded={open === i}
                            aria-controls={`faq-${i}`}
                            className="w-full flex items-center justify-between py-5 text-left font-bold cursor-pointer"
                        >
                            {faq.question}
                            <ChevronDownIcon
                                className={`w-5 h-5 transition-transform ${open === i ? "rotate-180" : ""}`}
                            />
                        </button>

                        {open === i && (
                            <p id={`faq-${i}`} className="pb-5 text-slate-700">
                                {faq.answer}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            <p className="mt-8 text-sm">
                <span className="font-bold">Other questions?</span> Visit our{" "}
                <a href="/placeholder?title=Amazon%20Pharmacy%20Help%20Center" className="underline">
                    Help Center ›
                </a>
            </p>
        </section>
    );
};

export default Faq;
