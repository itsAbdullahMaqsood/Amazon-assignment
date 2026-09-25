"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import { useAppDispatch } from "@/redux/hooks";
import { openAssistant } from "@/redux/slices/AssistantSlice";

// The answer is not recorded anywhere, and the page says so: there is no one at
// the other end to read it. What it does instead is useful — on a no, it opens
// Shabana with the question already framed.
const HelpfulVote = ({ topic }: any) => {
    const dispatch = useAppDispatch();
    const [vote, setVote] = useState("");

    return (
        <div className="mt-10 border-t border-line pt-5">
            {vote === "" ? (
                <>
                    <p className="text-sm font-medium text-fg">Did this answer it?</p>
                    <div className="mt-2 flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setVote("yes")}>
                            Yes
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setVote("no")}>
                            No
                        </Button>
                    </div>
                </>
            ) : vote === "yes" ? (
                <p className="text-sm text-fg-muted">
                    Good. Nothing was recorded — there is no support desk behind this store to read it.
                </p>
            ) : (
                <>
                    <p className="text-sm text-fg-muted">
                        Nothing was recorded, because there is no one here to read it. Shabana knows the catalogue and
                        can look at your question directly.
                    </p>
                    <Button
                        size="sm"
                        className="mt-3"
                        onClick={() => dispatch(openAssistant({ prompt: `I need help with ${String(topic).toLowerCase()}` }))}
                    >
                        Ask Shabana
                    </Button>
                </>
            )}
        </div>
    );
};

export default HelpfulVote;
