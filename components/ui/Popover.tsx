"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { cn } from "./cn";

// A click-to-open menu anchored under its trigger. Escape, a click outside and
// a navigation all close it; hover never opens it, so it works the same with a
// mouse, a keyboard or a finger.
const Popover = ({ trigger, triggerClassName = "", triggerLabel, align = "right", className = "", children }: any) => {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [lastPath, setLastPath] = useState(pathname);
    const ref = useRef<HTMLDivElement | null>(null);
    const id = useId();

    if (lastPath !== pathname) {
        setLastPath(pathname);
        setOpen(false);
    }

    useEffect(() => {
        if (!open) return;

        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        const onClick = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false);
        };

        document.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onClick);

        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onClick);
        };
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                aria-expanded={open}
                aria-controls={id}
                aria-label={triggerLabel}
                onClick={() => setOpen((value) => !value)}
                className={triggerClassName}
            >
                {trigger}
            </button>

            {open && (
                <div
                    id={id}
                    className={cn(
                        "absolute top-full z-50 mt-2 rounded-panel border border-line bg-surface text-fg shadow-pop animate-fade-in",
                        align === "right" ? "right-0" : "left-0",
                        className
                    )}
                    onClick={(e) => {
                        // Following a link inside closes the menu.
                        if ((e.target as HTMLElement).closest("a")) setOpen(false);
                    }}
                >
                    {children}
                </div>
            )}
        </div>
    );
};

export default Popover;
