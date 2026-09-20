"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
    ArrowUpIcon,
    EllipsisVerticalIcon,
    HandThumbDownIcon,
    HandThumbUpIcon,
    SparklesIcon,
    TruckIcon,
    UserIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

import AlexaWordmark from "./AlexaWordmark";
import ProductSuggestion from "./ProductSuggestion";

const capabilities = [
    { icon: SparklesIcon, label: "Design merch with AI" },
    { icon: TruckIcon, label: "Track orders", href: "/profile/orders" },
    { icon: SparklesIcon, label: "Best deals on women's dresses", prompt: "Best deals on women's dresses" },
];

const openers = [
    "What should I treat myself to?",
    "Recommend summer essentials under $25",
    "What do my purchases say about me?",
];

const deliveryText = () => {
    const date = new Date();
    date.setDate(date.getDate() + 4);
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

const AlexaPanel = ({ open, onClose }: any) => {
    const delivery = deliveryText();
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const send = async (text: string) => {
        const question = text.trim();

        if (!question || loading) {
            return;
        }

        const history = [...messages, { role: "user", content: question }];

        setMessages(history);
        setInput("");
        setError("");
        setLoading(true);

        try {
            const { data } = await axios.post("/api/alexa/chat", {
                messages: history.map((message: any) => ({
                    role: message.role,
                    content: message.content,
                })),
            });

            setMessages([
                ...history,
                {
                    role: "assistant",
                    content: data.reply,
                    groups: data.groups,
                    followUps: data.followUps,
                    unavailable: data.unavailable,
                },
            ]);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!open) {
        return null;
    }

    return (
        <>
            <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} aria-hidden="true" />

            <aside
                role="dialog"
                aria-label="Alexa for shopping"
                className="fixed top-0 left-0 z-50 h-screen w-full sm:w-[430px] bg-[#f7f7f7] flex flex-col shadow-2xl"
            >
                <header className="flex items-center gap-2 px-5 py-4 bg-white">
                    <AlexaWordmark />

                    <div className="ml-auto flex items-center gap-2 text-slate-600">
                        <button aria-label="Conversation options" className="p-1 cursor-pointer">
                            <EllipsisVerticalIcon className="w-6 h-6" />
                        </button>
                        <button onClick={onClose} aria-label="Close Alexa" className="p-1 cursor-pointer">
                            <XMarkIcon className="w-7 h-7" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {messages.length === 0 ? (
                        <>
                            <p className="text-lg">
                                Hello! I&apos;m the new Alexa.
                                <br />
                                Please select your profile so that I can provide personalized help.
                            </p>

                            <Link
                                href="/profile"
                                className="inline-flex items-center gap-2 bg-[#0a66c2] text-white rounded-full px-5 py-2.5 mt-4"
                            >
                                <UserIcon className="w-5 h-5" />
                                Select your profile
                            </Link>

                            <h3 className="font-bold mt-8">Things I can do</h3>

                            <div className="space-y-3 mt-3">
                                {capabilities.map((item) =>
                                    item.href ? (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-4 font-bold"
                                        >
                                            <item.icon className="w-8 h-8 text-slate-500" />
                                            {item.label}
                                        </Link>
                                    ) : (
                                        <button
                                            key={item.label}
                                            onClick={() => send(item.prompt || item.label)}
                                            className="w-full flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-4 font-bold text-left cursor-pointer"
                                        >
                                            <item.icon className="w-8 h-8 text-slate-500" />
                                            {item.label}
                                        </button>
                                    )
                                )}
                            </div>

                            <h3 className="font-bold mt-8">Questions while you shop? Ask away!</h3>

                            <div className="flex flex-col items-start gap-2 mt-3">
                                {openers.map((opener) => (
                                    <button
                                        key={opener}
                                        onClick={() => send(opener)}
                                        className="bg-[#dceaf8] text-[#0f4c81] rounded-full px-4 py-2 text-left cursor-pointer"
                                    >
                                        {opener}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            {messages.map((message: any, i: number) =>
                                message.role === "user" ? (
                                    <p
                                        key={i}
                                        className="bg-slate-200 rounded-2xl px-4 py-2 ml-auto w-fit max-w-[80%]"
                                    >
                                        {message.content}
                                    </p>
                                ) : (
                                    <div key={i} className="space-y-4">
                                        <p className="text-[17px] leading-relaxed">{message.content}</p>

                                        {message.unavailable && (
                                            <p className="text-sm text-slate-600">
                                                I couldn&apos;t find that in our catalogue yet.
                                            </p>
                                        )}

                                        {message.groups?.map((group: any) => (
                                            <div key={group.title} className="space-y-3">
                                                <div className="flex items-baseline justify-between">
                                                    <h4 className="font-bold">{group.title}</h4>
                                                    <Link
                                                        href={`/browse?search=${encodeURIComponent(group.title)}`}
                                                        className="text-[#0F5FA6] hover:underline"
                                                    >
                                                        see more
                                                    </Link>
                                                </div>

                                                {group.products.map((product: any) => (
                                                    <ProductSuggestion
                                                        key={product._id}
                                                        product={product}
                                                        delivery={delivery}
                                                    />
                                                ))}
                                            </div>
                                        ))}

                                        {message.followUps?.length > 0 && (
                                            <div className="flex flex-col items-start gap-2 pt-2">
                                                {message.followUps.map((followUp: string) => (
                                                    <button
                                                        key={followUp}
                                                        onClick={() => send(followUp)}
                                                        className="bg-[#bcd9f7] text-[#0f2f5b] rounded-full px-4 py-2.5 text-left font-medium cursor-pointer"
                                                    >
                                                        {followUp}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 text-slate-500 pt-1">
                                            <button aria-label="Helpful" className="cursor-pointer">
                                                <HandThumbUpIcon className="w-5 h-5" />
                                            </button>
                                            <button aria-label="Not helpful" className="cursor-pointer">
                                                <HandThumbDownIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            )}

                            {loading && <p className="text-slate-500">Alexa is thinking…</p>}
                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            <div ref={bottomRef} />
                        </div>
                    )}
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        send(input);
                    }}
                    className="p-4 bg-[#f7f7f7]"
                >
                    <div className="flex items-end gap-2 bg-white border border-slate-300 rounded-2xl p-3">
                        <label htmlFor="alexa-input" className="sr-only">
                            Ask a shopping question
                        </label>
                        <input
                            id="alexa-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a shopping question"
                            className="flex-1 outline-none"
                        />

                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            aria-label="Send"
                            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                        >
                            <ArrowUpIcon className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </aside>
        </>
    );
};

export default AlexaPanel;
