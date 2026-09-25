"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";

import useFocusTrap from "@/components/shared/useFocusTrap";
import { cn } from "./cn";

const panels: Record<string, string> = {
    right: "right-0 inset-y-0 w-full sm:w-[420px] animate-sheet-right",
    left: "left-0 inset-y-0 w-[88%] max-w-sm animate-sheet-left",
    bottom: "inset-x-0 bottom-0 max-h-[88vh] rounded-t-panel animate-sheet-bottom",
    center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-lg max-h-[88vh] rounded-panel animate-fade-in",
};

// A modal panel: side drawer, bottom sheet or centred dialog. Focus is trapped
// inside, Escape and the backdrop close it, and the page underneath stops
// scrolling while it is open.
const Sheet = ({ open, onClose, title, description, side = "right", footer, children, className = "", bodyClassName = "", hideHeader = false }: any) => {
    const ref = useRef<HTMLDivElement | null>(null);
    useFocusTrap(ref, open, onClose);

    useEffect(() => {
        if (!open) return;

        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previous;
        };
    }, [open]);

    // Only ever opened by a click, so it never renders during SSR.
    if (!open || typeof document === "undefined") {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 z-[60]">
            <div className="absolute inset-0 bg-ink-950/50 animate-fade-in" onClick={onClose} aria-hidden="true" />

            <div
                ref={ref}
                role="dialog"
                aria-modal="true"
                aria-label={typeof title === "string" ? title : undefined}
                className={cn("absolute flex flex-col bg-surface shadow-pop outline-none", panels[side], className)}
                tabIndex={-1}
            >
                {!hideHeader && (
                    <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 border-b border-line">
                        <div className="min-w-0">
                            <h2 className="font-display text-lg font-semibold text-fg">{title}</h2>
                            {description && <p className="text-sm text-fg-muted mt-0.5">{description}</p>}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="-mr-2 -mt-1 h-10 w-10 shrink-0 flex items-center justify-center rounded-card text-fg-muted hover:bg-surface-muted cursor-pointer"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                )}

                <div className={cn("flex-1 overflow-y-auto", !hideHeader && "px-5 py-4", bodyClassName)}>{children}</div>

                {footer && <div className="px-5 py-4 border-t border-line bg-surface">{footer}</div>}
            </div>
        </div>,
        document.body
    );
};

export default Sheet;
