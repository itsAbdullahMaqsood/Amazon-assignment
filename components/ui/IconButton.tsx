import Link from "next/link";

import { cn } from "./cn";

const tones: Record<string, string> = {
    default: "text-fg hover:bg-surface-muted",
    inverse: "text-fg-inverse hover:bg-fg-inverse/10",
    outline: "border border-line-strong bg-surface text-fg hover:bg-surface-muted",
};

// A square, labelled, icon-only control. `label` is required: it is the only
// name a screen reader gets.
const IconButton = ({ label, tone = "default", size = "md", href, className = "", children, ...rest }: any) => {
    const classes = cn(
        "inline-flex items-center justify-center shrink-0 rounded-card transition-colors cursor-pointer disabled:opacity-40",
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
        tones[tone],
        className
    );

    if (href) {
        return (
            <Link href={href} aria-label={label} title={label} className={classes} {...rest}>
                {children}
            </Link>
        );
    }

    return (
        <button type="button" aria-label={label} title={label} className={classes} {...rest}>
            {children}
        </button>
    );
};

export default IconButton;
