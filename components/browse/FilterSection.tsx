"use client";

import { useState } from "react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

const FilterSection = ({ title, children, defaultOpen = false }: any) => {
    const [open, setOpen] = useState<boolean>(defaultOpen);
    const id = `filter-${title.replace(/\s+/g, "-").toLowerCase()}`;

    return (
        <div className="w-full border-b border-slate-200 py-2">
            <button
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-controls={id}
                className="w-full flex items-center justify-between font-semibold cursor-pointer"
            >
                {title}
                {open ? <MinusIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
            </button>

            {open && (
                <div id={id} className="mt-2">
                    {children}
                </div>
            )}
        </div>
    );
};

export default FilterSection;
