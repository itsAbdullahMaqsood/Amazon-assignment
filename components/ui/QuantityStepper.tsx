"use client";

import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

import { cn } from "./cn";

// − qty + with the stock as its ceiling. When `onRemove` is given, the minus
// button turns into a bin at quantity 1, so there is no dead state.
const QuantityStepper = ({ value, min = 1, max = 99, onChange, onRemove, disabled, size = "md", label = "Quantity" }: any) => {
    const qty = Number(value) || min;
    const h = size === "sm" ? "h-8" : "h-10";
    const w = size === "sm" ? "w-8" : "w-10";
    const atMin = qty <= min;

    return (
        <div
            role="group"
            aria-label={label}
            className={cn("inline-flex items-center rounded-card border border-line-strong bg-surface", h)}
        >
            {atMin && onRemove ? (
                <button type="button" onClick={onRemove} disabled={disabled} aria-label="Remove" className={cn(w, "h-full flex items-center justify-center text-fg-muted hover:text-danger cursor-pointer")}>
                    <TrashIcon className="h-4 w-4" />
                </button>
            ) : (
                <button
                    type="button"
                    onClick={() => onChange(qty - 1)}
                    disabled={disabled || atMin}
                    aria-label="Decrease quantity"
                    className={cn(w, "h-full flex items-center justify-center text-fg hover:bg-surface-muted rounded-l-card disabled:text-fg-subtle disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed")}
                >
                    <MinusIcon className="h-4 w-4" />
                </button>
            )}

            <span aria-live="polite" className="min-w-8 px-1 text-center text-sm font-semibold tabular">
                {qty}
            </span>

            <button
                type="button"
                onClick={() => onChange(qty + 1)}
                disabled={disabled || qty >= max}
                aria-label="Increase quantity"
                className={cn(w, "h-full flex items-center justify-center text-fg hover:bg-surface-muted rounded-r-card disabled:text-fg-subtle disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed")}
            >
                <PlusIcon className="h-4 w-4" />
            </button>
        </div>
    );
};

export default QuantityStepper;
