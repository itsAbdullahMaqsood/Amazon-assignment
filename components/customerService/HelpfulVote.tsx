"use client";

import { useState } from "react";

// The vote is not recorded anywhere; it acknowledges the answer and, on a no,
// points at the topics most likely to hold what the reader was after.
const HelpfulVote = ({ topic }: any) => {
    const [vote, setVote] = useState<string>("");

    if (vote) {
        return (
            <div className="border-t border-slate-200 pt-4 mt-8">
                <p className="text-sm font-bold">Thanks for your feedback.</p>
                {vote === "no" && (
                    <p className="text-sm text-slate-600 mt-1">
                        Sorry this didn&apos;t answer your question about {topic.toLowerCase()}. The
                        related topics in the sidebar are the closest ones we have.
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="border-t border-slate-200 pt-4 mt-8">
            <p className="text-sm font-bold">Was this information helpful?</p>

            <div className="flex gap-3 mt-2">
                <button
                    onClick={() => setVote("yes")}
                    className="px-8 py-1 rounded-full text-sm border border-slate-400 bg-white hover:bg-slate-100 shadow-sm cursor-pointer"
                >
                    Yes
                </button>
                <button
                    onClick={() => setVote("no")}
                    className="px-8 py-1 rounded-full text-sm border border-slate-400 bg-white hover:bg-slate-100 shadow-sm cursor-pointer"
                >
                    No
                </button>
            </div>
        </div>
    );
};

export default HelpfulVote;
