"use client";

import { useEffect, useState } from "react";
import { ChatBubbleLeftRightIcon, PhoneIcon, XMarkIcon } from "@heroicons/react/24/outline";

// Nothing here reaches a person: this is a coursework build with no support desk
// behind it, and the dialog says so rather than pretending a ticket was raised.
const options = [
    {
        id: "chat",
        icon: ChatBubbleLeftRightIcon,
        label: "Start a chat",
        hint: "Message an associate about an order",
        body: "There is no support desk behind this site. Nothing you type here would reach a person, so the chat is switched off rather than left to time out. The help articles above cover everything this build can actually do.",
    },
    {
        id: "call",
        icon: PhoneIcon,
        label: "Request a call",
        hint: "We call you, usually within a minute",
        body: "No phone number is dialled and none is stored. This is a university project, so the call-back queue is not wired to anything — try the help articles above, or open the order you have a question about.",
    },
];

const ContactPanel = () => {
    const [open, setOpen] = useState<string>("");

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen("");

        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    const active = options.find((option) => option.id === open);

    return (
        <>
            <div className="grid md:grid-cols-2 gap-4">
                {options.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => setOpen(option.id)}
                        className="flex items-center gap-3 border border-slate-300 rounded-lg bg-white p-4 text-left hover:shadow-md hover:border-slate-400 transition cursor-pointer"
                    >
                        <option.icon className="h-8 w-8 text-[#232f3e] shrink-0" />
                        <span>
                            <span className="block font-bold text-sm">{option.label}</span>
                            <span className="block text-xs text-slate-600">{option.hint}</span>
                        </span>
                    </button>
                ))}
            </div>

            {active && (
                <div
                    onClick={() => setOpen("")}
                    className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 pt-24"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label={active.label}
                        className="w-full max-w-md bg-white rounded-lg shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                            <h2 className="text-lg font-bold">{active.label}</h2>

                            <button
                                onClick={() => setOpen("")}
                                aria-label="Close"
                                className="p-1 rounded hover:bg-slate-100 cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="px-5 py-4 text-sm text-slate-700">{active.body}</p>

                        <div className="flex justify-end px-5 pb-4">
                            <button
                                onClick={() => setOpen("")}
                                className="button-orange px-8 py-1.5 text-sm cursor-pointer"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ContactPanel;
