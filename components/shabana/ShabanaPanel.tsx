"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowPathIcon, ArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { askShabana, closeAssistant, newConversation, selectAssistant } from "@/redux/slices/AssistantSlice";
import Sheet from "@/components/ui/Sheet";
import { Notice } from "@/components/ui/Layout";
import { cn } from "@/components/ui/cn";
import ShabanaMark from "./ShabanaMark";
import ProductSuggestion from "./ProductSuggestion";

const starters = [
    "A gift for a runner under $50",
    "Compare the best-rated smartphones",
    "Skin care for dry skin",
    "Kitting out a small kitchen",
];

const productStarters = ["What do reviewers say?", "Is it worth the price?", "What are the main downsides?"];

const Typing = () => (
    <div className="flex items-center gap-1.5 py-2" aria-label="Shabana is typing">
        {[0, 1, 2].map((i) => (
            <span key={i} className="h-2 w-2 rounded-full bg-accent-strong animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
        ))}
    </div>
);

// Shabana, the shopping assistant: a side sheet on desktop, full screen on a
// phone. Answers are grounded in the catalogue: every product card is a real
// row, and when a product is in context her answers come from its own
// description, specs and reviews.
const ShabanaPanel = () => {
    const dispatch = useAppDispatch();
    const { open, messages, loading, error, context } = useAppSelector(selectAssistant);
    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const close = () => dispatch(closeAssistant());

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages.length, loading]);

    const send = (text: string) => {
        const question = text.trim();

        if (!question || loading) return;

        setInput("");
        dispatch(askShabana(question));
    };

    const lastUser = [...messages].reverse().find((message) => message.role === "user");
    const suggestions = context.length ? productStarters : starters;

    return (
        <Sheet open={open} onClose={close} side="right" title="Shabana" hideHeader className="sm:w-[440px]" bodyClassName="flex flex-col bg-canvas">
            <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
                <ShabanaMark />
                <div className="min-w-0 flex-1">
                    <h2 className="font-display text-lg font-semibold leading-tight">Shabana</h2>
                    <p className="truncate text-xs text-fg-muted">
                        {context.length ? `Talking about ${context.map((c) => c.name).join(" and ")}` : "Your shopping assistant"}
                    </p>
                </div>
                {messages.length > 0 && (
                    <button
                        type="button"
                        onClick={() => dispatch(newConversation())}
                        className="flex items-center gap-1 rounded-control px-2 py-1.5 text-sm text-fg-muted hover:bg-surface-muted hover:text-fg cursor-pointer"
                    >
                        <ArrowPathIcon className="h-4 w-4" />
                        New chat
                    </button>
                )}
                <button
                    type="button"
                    onClick={close}
                    aria-label="Close Shabana"
                    className="flex h-10 w-10 items-center justify-center rounded-card text-fg-muted hover:bg-surface-muted cursor-pointer"
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5" aria-live="polite">
                {messages.length === 0 ? (
                    <div>
                        <p className="font-display text-xl font-semibold text-fg">
                            {context.length ? "Ask me anything about it." : "Hi, I'm Shabana."}
                        </p>
                        <p className="mt-1 text-fg-muted">
                            {context.length
                                ? "I'll answer from its description, specs and what reviewers wrote, and say so when they don't cover it."
                                : "Tell me what you're shopping for, who it's for or what it needs to do, and I'll find it in the Markaz catalogue."}
                        </p>
                        <div className="mt-5 flex flex-col items-start gap-2">
                            {suggestions.map((starter) => (
                                <button
                                    key={starter}
                                    type="button"
                                    onClick={() => send(starter)}
                                    className="rounded-full border border-line bg-surface px-3.5 py-2 text-left text-sm text-fg hover:border-accent-ink hover:bg-accent-soft cursor-pointer"
                                >
                                    {starter}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {messages.map((message, i) =>
                            message.role === "user" ? (
                                <p key={i} className="ml-auto w-fit max-w-[85%] rounded-panel rounded-br-control bg-ink-900 px-4 py-2.5 text-sm text-fg-inverse">
                                    {message.content}
                                </p>
                            ) : (
                                <div key={i} className="space-y-3">
                                    <div className="flex gap-2.5">
                                        <ShabanaMark size="sm" className="mt-0.5" />
                                        <p className="text-[15px] leading-relaxed text-fg">{message.content}</p>
                                    </div>

                                    {message.groups?.map((group: any) => (
                                        <section key={group.title} className="space-y-2 pl-8">
                                            <div className="flex items-baseline justify-between gap-2">
                                                <h3 className="text-sm font-semibold">{group.title}</h3>
                                                {group.href && (
                                                    <Link href={group.href} onClick={close} className="text-link text-sm">
                                                        See all
                                                    </Link>
                                                )}
                                            </div>
                                            {group.products.map((product: any) => (
                                                <ProductSuggestion key={product._id} product={product} onNavigate={close} />
                                            ))}
                                        </section>
                                    ))}

                                    {i === messages.length - 1 && (message.followUps?.length || 0) > 0 && !loading && (
                                        <div className="flex flex-wrap gap-2 pl-8">
                                            {message.followUps!.map((followUp) => (
                                                <button
                                                    key={followUp}
                                                    type="button"
                                                    onClick={() => send(followUp)}
                                                    className="rounded-full bg-accent-soft px-3 py-1.5 text-left text-sm text-accent-ink hover:bg-accent cursor-pointer"
                                                >
                                                    {followUp}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        )}

                        {loading && (
                            <div className="flex gap-2.5">
                                <ShabanaMark size="sm" className="mt-1" />
                                <Typing />
                            </div>
                        )}

                        {error && (
                            <Notice tone="danger" title="That didn't go through">
                                {error}{" "}
                                {lastUser && (
                                    <button
                                        type="button"
                                        onClick={() => dispatch(askShabana(lastUser.content))}
                                        className="font-medium text-fg underline cursor-pointer"
                                    >
                                        Try again
                                    </button>
                                )}
                            </Notice>
                        )}
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    send(input);
                }}
                className="border-t border-line bg-surface p-3"
            >
                <div className="flex items-end gap-2 rounded-panel border border-line-strong bg-surface p-1.5 pl-3.5 focus-within:border-accent-ink focus-within:ring-2 focus-within:ring-accent/60">
                    <label htmlFor="shabana-input" className="sr-only">
                        Message Shabana
                    </label>
                    <textarea
                        id="shabana-input"
                        rows={1}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                send(input);
                            }
                        }}
                        placeholder={context.length ? "Ask about this product" : "What are you looking for?"}
                        className="max-h-32 min-h-9 flex-1 resize-none bg-transparent py-2 text-base outline-none placeholder:text-fg-subtle md:text-sm"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        aria-label="Send"
                        className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-card transition-colors cursor-pointer",
                            input.trim() ? "bg-accent text-fg hover:bg-accent-strong" : "bg-surface-muted text-fg-subtle"
                        )}
                    >
                        <ArrowUpIcon className="h-5 w-5 stroke-2" />
                    </button>
                </div>
                <p className="mt-2 text-center text-xs text-fg-subtle">Shabana only suggests products Markaz actually stocks.</p>
            </form>
        </Sheet>
    );
};

export default ShabanaPanel;
