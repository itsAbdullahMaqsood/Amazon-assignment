"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import axios from "axios";
import {
    ArrowUpIcon,
    EllipsisVerticalIcon,
    HandThumbDownIcon,
    HandThumbUpIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

import AlexaWordmark from "./AlexaWordmark";
import ProductSuggestion from "./ProductSuggestion";

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

    if (!open || typeof document === "undefined") {
        return null;
    }

    // Portalled to the body: inside the header nav the panel inherited
    // text-white and whitespace-nowrap, and shared that nav's stacking and
    // overflow context.
    return createPortal(
        <div className="text-fg whitespace-normal normal-case">
            <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} aria-hidden="true" />

            <aside
                role="dialog"
                aria-label="Shabana for shopping"
                className="fixed top-0 left-0 z-50 h-screen w-full sm:w-[430px] bg-surface-muted flex flex-col shadow-2xl"
            >
                <header className="flex items-center gap-2 px-5 py-4 bg-white">
                    <AlexaWordmark />

                    <div className="ml-auto flex items-center gap-2 text-slate-600">
                        <button aria-label="Conversation options" className="p-1 cursor-pointer">
                            <EllipsisVerticalIcon className="w-6 h-6" />
                        </button>
                        <button onClick={onClose} aria-label="Close Shabana" className="p-1 cursor-pointer">
                            <XMarkIcon className="w-7 h-7" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {messages.length === 0 ? null : (
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
                                                        className="text-accent-ink hover:underline"
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
                                                        className="bg-accent-soft text-ink-950 rounded-full px-4 py-2.5 text-left font-medium cursor-pointer"
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

                            {loading && <p className="text-slate-500">Shabana is thinking…</p>}
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
                    className="p-4 bg-surface-muted"
                >
                    <div className="bg-white border border-slate-300 rounded-2xl px-4 pt-4 pb-3">
                        <label htmlFor="alexa-input" className="sr-only">
                            Ask a shopping question
                        </label>
                        <input
                            id="alexa-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a shopping question"
                            className="w-full text-lg outline-none placeholder:text-slate-500"
                        />

                        <div className="flex justify-end mt-4">
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                aria-label="Send"
                                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                            >
                                <ArrowUpIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </form>
            </aside>
        </div>,
        document.body
    );
};

export default AlexaPanel;
