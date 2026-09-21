"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckIcon, CreditCardIcon, XMarkIcon } from "@heroicons/react/24/outline";

// Every benefit on this page is invented for the assignment, and the card art is
// composed from gradients and shapes rather than any issuer or network logo.
const offers = [
    {
        id: "store-card",
        name: "Amazon Store Card",
        art: { from: "#232f3e", to: "#3c4b61", ink: "#febd69" },
        headline: "5% back for members",
        benefits: [
            "5% back on eligible purchases for members",
            "No annual card fee",
            "Equal monthly payments on orders over $150",
        ],
    },
    {
        id: "rewards-visa",
        name: "Amazon Rewards Card",
        art: { from: "#0b4f6c", to: "#1b7f9e", ink: "#e8f6fb" },
        headline: "3% back everywhere you shop",
        benefits: [
            "3% back on this store, 2% at restaurants and fuel",
            "1% back on everything else",
            "No foreign transaction fees",
        ],
    },
    {
        id: "business-card",
        name: "Amazon Business Card",
        art: { from: "#5c3b18", to: "#a5772f", ink: "#fbe9c6" },
        headline: "Choose rewards or 60-day terms",
        benefits: [
            "Switch between 5% back and extended payment terms",
            "Spending reports for the whole team",
            "No annual card fee",
        ],
    },
];

const CardArt = ({ art, label, tail }: any) => (
    <div
        className="rounded-xl h-40 p-4 flex flex-col justify-between relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${art.from}, ${art.to})`, color: art.ink }}
    >
        <span
            aria-hidden="true"
            className="absolute -right-10 -top-12 w-40 h-40 rounded-full opacity-15"
            style={{ background: art.ink }}
        />

        <p className="font-bold tracking-wide">amazon</p>

        <div>
            <span
                aria-hidden="true"
                className="block w-9 h-6 rounded-sm mb-3 opacity-80"
                style={{ background: art.ink }}
            />
            <p className="font-mono text-sm tracking-[0.2em]">
                •••• •••• •••• {tail || "0000"}
            </p>
            <p className="text-xs mt-1 opacity-80">{label}</p>
        </div>
    </div>
);

const CreditCardsClient = ({ savedCards = [] }: any) => {
    const [applying, setApplying] = useState<any>(null);

    return (
        <div>
            <section>
                <h2 className="text-xl font-bold">Amazon credit cards</h2>
                <p className="text-sm text-slate-600 mt-1">
                    Compare the store cards available on this account.
                </p>

                <div className="grid md:grid-cols-3 gap-5 mt-5">
                    {offers.map((offer) => (
                        <div
                            key={offer.id}
                            className="border border-slate-300 rounded-lg p-4 flex flex-col"
                        >
                            <CardArt art={offer.art} label={offer.name} tail="0000" />

                            <h3 className="font-bold mt-4">{offer.name}</h3>
                            <p className="text-sm text-[#C7511F] font-semibold">{offer.headline}</p>

                            <ul className="mt-3 space-y-1.5 text-sm grow">
                                {offer.benefits.map((benefit) => (
                                    <li key={benefit} className="flex items-start gap-2">
                                        <CheckIcon className="h-4 mt-0.5 shrink-0 text-green-700" />
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => setApplying(offer)}
                                className="mt-4 w-full px-6 py-2 rounded-full bg-linear-to-r from-amazon-orange to-yellow-300 text-amazon-blue_dark cursor-pointer"
                            >
                                Apply now
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-bold">Your cards</h2>

                {savedCards.length === 0 ? (
                    <div className="border border-slate-300 rounded-lg p-8 mt-4 text-center">
                        <CreditCardIcon className="h-10 mx-auto text-slate-400" />
                        <p className="font-semibold mt-3">
                            You have no cards saved to this account.
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                            Cards you save as a payment method show up here.
                        </p>
                        <Link
                            href="/profile/payment"
                            className="inline-block mt-5 px-6 py-2 rounded-full bg-linear-to-r from-amazon-orange to-yellow-300 text-amazon-blue_dark"
                        >
                            Manage payment methods
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-5 mt-4">
                        {savedCards.map((card: any) => (
                            <div key={card.id} className="border border-slate-300 rounded-lg p-4">
                                <CardArt
                                    art={{ from: "#1f2937", to: "#4b5563", ink: "#f3f4f6" }}
                                    label={card.name}
                                    tail={card.tail}
                                />
                                <p className="font-semibold mt-3">{card.name}</p>
                                <p className="text-sm text-slate-600">{card.description}</p>
                                <Link
                                    href="/profile/payment"
                                    className="text-sm text-[#007185] hover:underline mt-2 inline-block"
                                >
                                    Edit payment methods
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {applying && (
                <div
                    onClick={() => setApplying(null)}
                    className="fixed top-0 left-0 w-full h-full bg-black/40 z-50 flex items-center justify-center"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label={`${applying.name} application`}
                        className="w-full max-w-sm mx-3 bg-white rounded shadow-lg overflow-hidden"
                    >
                        <div className="flex items-center bg-amazon-blue_light text-white px-4 py-2">
                            <span className="font-semibold grow">{applying.name}</span>
                            <button
                                onClick={() => setApplying(null)}
                                aria-label="Close"
                                className="cursor-pointer"
                            >
                                <XMarkIcon className="h-5" />
                            </button>
                        </div>

                        <div className="p-4 text-sm space-y-3">
                            <p>
                                Card applications aren&apos;t part of this build. Nothing was
                                submitted and no credit check was run.
                            </p>
                            <p className="text-slate-600">
                                The offer details on this page are written for the assignment and do
                                not describe a real product.
                            </p>
                        </div>

                        <div className="flex justify-end p-4 pt-0">
                            <button
                                onClick={() => setApplying(null)}
                                className="button-orange px-8 py-1.5 text-sm cursor-pointer"
                            >
                                Ok
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreditCardsClient;
