"use client";

import { useState } from "react";

import AlexaPanel from "./AlexaPanel";

const AlexaLauncher = () => {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={open}
                className="flex items-center bg-white rounded-full px-3 py-1 cursor-pointer"
            >
                <span className="text-[#00758f] italic font-semibold mr-1">alexa</span>
                <span className="text-slate-800 text-sm">for shopping</span>
            </button>

            <AlexaPanel open={open} onClose={() => setOpen(false)} />
        </>
    );
};

export default AlexaLauncher;
