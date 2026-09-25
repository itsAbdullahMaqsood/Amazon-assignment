import { forwardRef } from "react";

import { cn } from "./cn";

export const Checkbox = forwardRef<HTMLInputElement, any>(({ label, description, className = "", ...rest }, ref) => (
    <label className={cn("flex items-start gap-3 cursor-pointer text-sm", className)}>
        <input
            ref={ref}
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border-line-strong accent-accent-ink cursor-pointer"
            {...rest}
        />
        <span>
            <span className="text-fg">{label}</span>
            {description && <span className="block text-fg-muted mt-0.5">{description}</span>}
        </span>
    </label>
));
Checkbox.displayName = "Checkbox";

// A whole card that behaves as one radio option: payment methods, addresses,
// plans. The native input stays in the DOM for keyboard and form semantics.
export const RadioCard = ({ checked, label, description, aside, children, className = "", ...rest }: any) => (
    <label
        className={cn(
            "relative flex items-start gap-3 rounded-card border p-4 cursor-pointer transition-colors",
            checked ? "border-accent-ink bg-accent-soft ring-1 ring-accent-ink" : "border-line bg-surface hover:border-line-strong",
            className
        )}
    >
        <input type="radio" checked={checked} className="mt-1 h-4 w-4 shrink-0 accent-accent-ink cursor-pointer" {...rest} />
        <span className="flex-1 min-w-0">
            <span className="flex items-start justify-between gap-3">
                <span className="font-medium text-fg">{label}</span>
                {aside}
            </span>
            {description && <span className="block text-sm text-fg-muted mt-0.5">{description}</span>}
            {children}
        </span>
    </label>
);

// On/off switch for settings rows.
export const Switch = ({ checked, onChange, label, description, disabled }: any) => (
    <label className="flex items-start justify-between gap-6 cursor-pointer py-3">
        <span>
            <span className="block text-sm font-medium text-fg">{label}</span>
            {description && <span className="block text-sm text-fg-muted mt-0.5">{description}</span>}
        </span>
        <span className="relative inline-flex shrink-0 mt-0.5">
            <input
                type="checkbox"
                role="switch"
                checked={checked}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
                className="peer sr-only"
            />
            <span className="h-6 w-11 rounded-full bg-line-strong transition-colors peer-checked:bg-accent-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-ink peer-disabled:opacity-50" />
            <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface shadow-card transition-transform peer-checked:translate-x-5" />
        </span>
    </label>
);
