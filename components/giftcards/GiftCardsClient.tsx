"use client";

import { useState } from "react";
import axios from "axios";
import { GiftIcon } from "@heroicons/react/24/outline";

import Price from "@/components/shared/Price";
import GiftCardArt, { giftCardDesigns } from "./art";
import { AMOUNT_PRESETS, SAMPLE_CODES, giftCardCode } from "@/lib/giftcards";

const tabs = [
    { value: "balance", label: "Your account balance" },
    { value: "redeem", label: "Redeem a gift card" },
    { value: "buy", label: "Buy a gift card" },
    { value: "reload", label: "Reload your balance" },
];

const historyLabel = (entry: any) =>
    entry.type === "used" ? "Applied to an order" : "Gift card redeemed";

const GiftCardsClient = ({ name, balance: initialBalance, history: initialHistory }: any) => {
    const [tab, setTab] = useState("balance");
    const [balance, setBalance] = useState(Number(initialBalance || 0));
    const [history, setHistory] = useState<any[]>(initialHistory || []);
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [design, setDesign] = useState("classic");
    const [amount, setAmount] = useState(25);
    const [issued, setIssued] = useState("");

    const redeemHandler = async (e: any) => {
        e.preventDefault();

        try {
            setError("");
            setMessage("");

            const { data } = await axios.post("/api/user/giftcard/redeem", { code });

            setBalance(data.balance);
            setHistory(data.history || []);
            setMessage(data.message);
            setCode("");
        } catch (err: any) {
            setMessage("");
            setError(err.response?.data?.message || err.message);
        }
    };

    const issueHandler = () => {
        setIssued(giftCardCode(amount));
    };

    return (
        <div>
            <nav aria-label="Gift card sections" className="border-b border-slate-300">
                <ul className="flex flex-wrap items-center gap-6 text-sm md:text-base">
                    {tabs.map((entry) => (
                        <li key={entry.value}>
                            <button
                                onClick={() => setTab(entry.value)}
                                aria-current={tab === entry.value ? "page" : undefined}
                                className={`block py-3 -mb-px border-b-[3px] cursor-pointer ${
                                    tab === entry.value
                                        ? "border-accent-ink text-accent-ink font-bold"
                                        : "border-transparent hover:text-accent-deep"
                                }`}
                            >
                                {entry.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {tab === "balance" && (
                <div className="mt-6 grid md:grid-cols-[320px_1fr] gap-6">
                    <div className="border border-slate-300 rounded-lg p-5">
                        <GiftCardArt design="classic" className="mb-4" />
                        <p className="text-sm text-slate-600">Gift card balance</p>
                        <Price value={balance} size="lg" className="mt-1" />
                        <p className="text-sm text-slate-600 mt-3">
                            {name ? `${name}'s balance` : "Your balance"} is offered at checkout
                            and covers as much of the order as it can before your payment method
                            is charged.
                        </p>
                        <button
                            onClick={() => setTab("redeem")}
                            className="mt-4 w-full px-6 py-2 rounded-full bg-accent text-ink-900 cursor-pointer"
                        >
                            Redeem a gift card
                        </button>
                    </div>

                    <div className="border border-slate-300 rounded-lg p-5">
                        <h2 className="font-bold text-lg">Gift card activity</h2>

                        {history.length === 0 ? (
                            <p className="text-sm text-slate-600 mt-3">
                                Nothing has been redeemed on this account yet. Redeemed cards and the
                                orders they pay for are listed here.
                            </p>
                        ) : (
                            <ul className="mt-3 divide-y divide-slate-200">
                                {[...history].reverse().map((entry: any, i: number) => (
                                    <li
                                        key={`${entry.code}-${i}`}
                                        className="flex items-center gap-3 py-3"
                                    >
                                        <GiftIcon className="h-6 text-slate-500 shrink-0" />
                                        <div className="grow">
                                            <p className="text-sm font-semibold">
                                                {historyLabel(entry)}
                                            </p>
                                            <p className="text-xs text-slate-600">
                                                {entry.code} ·{" "}
                                                {new Date(entry.at).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                        <span
                                            className={
                                                entry.type === "used"
                                                    ? "text-accent-deep"
                                                    : "text-green-700"
                                            }
                                        >
                                            {entry.type === "used" ? "-" : "+"}
                                            <Price value={entry.amount} size="sm" />
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {tab === "redeem" && (
                <div className="mt-6 max-w-xl border border-slate-300 rounded-lg p-5">
                    <h2 className="font-bold text-lg">Redeem a gift card</h2>
                    <p className="text-sm text-slate-600 mt-1">
                        Enter the claim code exactly as it appears on the card.
                    </p>

                    <form onSubmit={redeemHandler} className="flex flex-wrap gap-3 mt-4">
                        <input
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="MRKZ-0000-0000"
                            aria-label="Claim code"
                            className="grow min-w-56 border border-slate-400 rounded px-3 py-2 outline-none focus:border-accent"
                        />
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-full bg-accent text-ink-900 cursor-pointer"
                        >
                            Apply to your balance
                        </button>
                    </form>

                    {message && <p className="text-green-700 text-sm mt-3">{message}</p>}
                    {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

                    <div className="mt-5 bg-slate-50 border border-slate-200 rounded p-4 text-sm">
                        <p className="font-semibold">Test codes for this build</p>
                        <p className="text-slate-600 mt-1">
                            Codes are <span className="font-mono">MRKZ-&lt;amount&gt;-&lt;check&gt;</span>,
                            where the amount is the face value in whole dollars and the check digits
                            are (amount × 7919) mod 10000. Each code can only be redeemed once.
                        </p>
                        <ul className="mt-2 font-mono text-slate-800 space-y-1">
                            {SAMPLE_CODES.map((sample) => (
                                <li key={sample}>{sample}</li>
                            ))}
                        </ul>
                    </div>

                    <p className="text-sm mt-4">
                        Current balance: <Price value={balance} size="sm" />
                    </p>
                </div>
            )}

            {tab === "buy" && (
                <div className="mt-6">
                    <h2 className="font-bold text-lg">Buy a gift card</h2>
                    <p className="text-sm text-slate-600 mt-1">
                        Pick a design and an amount. Checkout for gift cards isn&apos;t part of this
                        build, so the card is issued straight away as a claim code you can redeem.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-5">
                        {giftCardDesigns.map((entry) => (
                            <button
                                key={entry.value}
                                onClick={() => setDesign(entry.value)}
                                aria-pressed={design === entry.value}
                                className={`rounded-lg p-2 border-2 cursor-pointer transition ${
                                    design === entry.value
                                        ? "border-accent-ink"
                                        : "border-transparent hover:border-slate-300"
                                }`}
                            >
                                <GiftCardArt design={entry.value} amount={amount} />
                                <p className="text-sm mt-2">{entry.label}</p>
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <span className="text-sm font-semibold">Amount:</span>
                        {AMOUNT_PRESETS.map((preset) => (
                            <button
                                key={preset}
                                onClick={() => setAmount(preset)}
                                aria-pressed={amount === preset}
                                className={`px-4 py-1.5 rounded-full border text-sm cursor-pointer ${
                                    amount === preset
                                        ? "bg-ink-800 text-white border-ink-800"
                                        : "border-slate-400 hover:bg-slate-100"
                                }`}
                            >
                                ${preset}
                            </button>
                        ))}

                        <button
                            onClick={issueHandler}
                            className="px-6 py-2 rounded-full bg-accent text-ink-900 cursor-pointer"
                        >
                            Issue claim code
                        </button>
                    </div>

                    {issued && (
                        <div className="mt-4 bg-slate-50 border border-slate-200 rounded p-4 text-sm max-w-xl">
                            <p className="font-semibold">Your ${amount} claim code</p>
                            <p className="font-mono text-lg mt-1">{issued}</p>
                            <button
                                onClick={() => {
                                    setCode(issued);
                                    setTab("redeem");
                                }}
                                className="text-accent-ink hover:underline cursor-pointer mt-2"
                            >
                                Redeem it now
                            </button>
                        </div>
                    )}
                </div>
            )}

            {tab === "reload" && (
                <div className="mt-6 max-w-xl border border-slate-300 rounded-lg p-5">
                    <h2 className="font-bold text-lg">Reload your balance</h2>
                    <p className="text-sm text-slate-600 mt-1">
                        A reload charges a saved card and tops up your gift card balance. Card
                        payments aren&apos;t part of this build, so reloads are issued as claim codes
                        instead.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        {AMOUNT_PRESETS.map((preset) => (
                            <button
                                key={preset}
                                onClick={() => setAmount(preset)}
                                aria-pressed={amount === preset}
                                className={`px-4 py-1.5 rounded-full border text-sm cursor-pointer ${
                                    amount === preset
                                        ? "bg-ink-800 text-white border-ink-800"
                                        : "border-slate-400 hover:bg-slate-100"
                                }`}
                            >
                                ${preset}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={issueHandler}
                        className="mt-5 px-6 py-2 rounded-full bg-accent text-ink-900 cursor-pointer"
                    >
                        Reload ${amount}
                    </button>

                    {issued && (
                        <p className="text-sm mt-4">
                            Use <span className="font-mono">{issued}</span> on the{" "}
                            <button
                                onClick={() => {
                                    setCode(issued);
                                    setTab("redeem");
                                }}
                                className="text-accent-ink hover:underline cursor-pointer"
                            >
                                Redeem a gift card
                            </button>{" "}
                            tab to complete the reload.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default GiftCardsClient;
