"use client";

import { useState } from "react";
import Link from "next/link";

import Card, { CardHeader } from "@/components/ui/Card";
import { money } from "@/components/ui/Price";
import { Notice } from "@/components/ui/Layout";
import RedeemForm from "./RedeemForm";

const dateOf = (value: any) =>
    value ? new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "";

const GiftCardsView = ({ balance: initialBalance, history: initialHistory, demoCodes }: any) => {
    const [balance, setBalance] = useState(Number(initialBalance || 0));
    const [history, setHistory] = useState<any[]>(initialHistory || []);

    const redeemed = (data: any) => {
        setBalance(data.balance);
        setHistory(data.history || []);
    };

    const ledger = [...history].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

    return (
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
            <Card>
                <CardHeader
                    title="Your balance"
                    description="Spent before your payment method on the next order that uses it, and it never expires."
                />

                <p className="font-display text-4xl font-semibold tabular text-fg">{money(balance)}</p>

                <p className="mt-3 text-sm text-fg-muted">
                    At checkout it comes off the total automatically; you can turn it off there for one order if you
                    would rather keep it.{" "}
                    <Link href="/cart" className="text-link">
                        Go to your cart
                    </Link>
                    .
                </p>

                <div className="mt-6 border-t border-line pt-5">
                    <h3 className="text-sm font-semibold text-fg">Redeem a claim code</h3>
                    <div className="mt-3">
                        <RedeemForm onRedeemed={redeemed} />
                    </div>
                </div>
            </Card>

            <div className="grid gap-4">
                <Card>
                    <CardHeader title="Every movement" description="Money in from a claim code, money out on an order." />

                    {ledger.length === 0 ? (
                        <p className="text-sm text-fg-muted">Nothing yet. Redeem a code and it shows up here.</p>
                    ) : (
                        <ul className="divide-y divide-line border-t border-line text-sm">
                            {ledger.map((entry: any, i: number) => (
                                <li key={i} className="flex items-baseline justify-between gap-3 py-2.5">
                                    <span className="min-w-0">
                                        <span className="block text-fg">
                                            {entry.type === "used" ? "Applied to an order" : `Claim code ${entry.code}`}
                                        </span>
                                        <span className="block text-xs text-fg-muted">{dateOf(entry.at)}</span>
                                    </span>
                                    <span className={entry.type === "used" ? "tabular text-fg-muted" : "tabular text-success"}>
                                        {entry.type === "used" ? "−" : "+"}
                                        {money(Math.abs(entry.amount))}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Notice tone="neutral" title="Markaz doesn't sell gift cards in this build">
                    <p>
                        Nothing here takes a payment, so no card is ever issued to anyone. These three codes exist so
                        the balance and checkout can be tried, and each one works once per account:
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                        {demoCodes.map((entry: any) => (
                            <li
                                key={entry.code}
                                className="rounded-control border border-dashed border-line-strong bg-surface px-2.5 py-1 font-medium tabular text-fg"
                            >
                                {entry.code}
                                <span className="ml-2 font-normal text-fg-muted">{money(entry.amount)}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-2">
                        A code carries its own value and a check digit, so it is validated by arithmetic on the server
                        rather than looked up in a table of cards that were never sold.
                    </p>
                </Notice>
            </div>
        </div>
    );
};

export default GiftCardsView;
