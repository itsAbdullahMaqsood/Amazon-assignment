"use client";

import { useState } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

const Accordion = ({ items }: any) => {
    const [active, setActive] = useState<number>(-1);

    const toggleHandler = (index: number) => {
        setActive(active === index ? -1 : index);
    };

    return (
        <div className="rounded border border-slate-200">
            {items.map((item: any, i: number) => (
                <div key={item.title} className="border-b border-slate-200 last:border-b-0">
                    <button
                        type="button"
                        onClick={() => toggleHandler(i)}
                        className="w-full flex items-center gap-2 p-4 text-left font-semibold cursor-pointer"
                    >
                        <ChevronRightIcon
                            className={`w-5 h-5 transition-transform ${active === i ? "rotate-90" : ""}`}
                        />
                        {item.title}
                    </button>

                    {active === i && (
                        <div className="p-4 border-t border-slate-200">{item.content}</div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Accordion;
