"use client";

import { useAppDispatch } from "@/redux/hooks";
import { openAssistant } from "@/redux/slices/AssistantSlice";
import ShabanaMark from "@/components/shabana/ShabanaMark";

// Replaces the product Q&A section, which had no data behind it. Shabana
// answers from this product's own description, specs and reviews, and says so
// when they don't cover a question.
const AskShabana = ({ product }: any) => {
    const dispatch = useAppDispatch();
    const context = [{ id: product._id, name: product.name }];
    const reviews = product.numberReviews || 0;

    const questions = [
        reviews >= 2 ? "What do reviewers say?" : "What is it good for?",
        "What are the main downsides?",
        "Is it worth the price?",
    ];

    return (
        <section aria-labelledby="ask-shabana" className="rounded-panel border border-accent bg-accent-soft p-4">
            <div className="flex items-start gap-3">
                <ShabanaMark />
                <div className="min-w-0">
                    <h2 id="ask-shabana" className="font-medium text-fg">
                        Questions about this product?
                    </h2>
                    <p className="mt-0.5 text-sm text-fg-muted">
                        Shabana answers from its description, specs{reviews ? ` and ${reviews} review${reviews === 1 ? "" : "s"}` : ""}.
                    </p>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                {questions.map((question) => (
                    <button
                        key={question}
                        type="button"
                        onClick={() => dispatch(openAssistant({ prompt: question, context }))}
                        className="rounded-full bg-surface px-3 py-1.5 text-sm text-fg ring-1 ring-accent hover:ring-accent-ink cursor-pointer"
                    >
                        {question}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() => dispatch(openAssistant({ context }))}
                    className="rounded-full px-3 py-1.5 text-sm font-medium text-accent-ink hover:underline cursor-pointer"
                >
                    Ask your own
                </button>
            </div>
        </section>
    );
};

export default AskShabana;
