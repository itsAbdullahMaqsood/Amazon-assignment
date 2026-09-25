import Link from "next/link";

import { cn } from "./cn";

const base =
    "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap rounded-card transition-colors duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink";

export const buttonVariants: Record<string, string> = {
    // Light purple with ink text: the one action a screen wants you to take.
    primary: "bg-accent text-fg hover:bg-accent-strong active:bg-accent-strong",
    // Navy: a confident second choice.
    secondary: "bg-ink-900 text-fg-inverse hover:bg-ink-700",
    outline: "border border-line-strong bg-surface text-fg hover:bg-surface-muted",
    ghost: "text-fg hover:bg-surface-muted",
    link: "text-accent-ink hover:text-accent-deep hover:underline underline-offset-2 px-0! h-auto!",
    danger: "bg-danger text-fg-inverse hover:bg-danger/90",
    "danger-outline": "border border-danger/40 text-danger bg-surface hover:bg-danger-soft",
    // For use on the navy chrome.
    inverse: "bg-fg-inverse/10 text-fg-inverse hover:bg-fg-inverse/20",
};

export const buttonSizes: Record<string, string> = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
};

export const buttonClass = ({ variant = "primary", size = "md", block = false, className = "" }: any = {}) =>
    cn(base, buttonVariants[variant], buttonSizes[size], block && "w-full", className);

const Spinner = () => (
    <span
        aria-hidden="true"
        className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin"
    />
);

// A <button>, or a <Link> when `href` is given, sharing one look.
const Button = ({
    variant = "primary",
    size = "md",
    block = false,
    loading = false,
    href,
    className = "",
    children,
    type = "button",
    ...rest
}: any) => {
    const classes = buttonClass({ variant, size, block, className });

    if (href) {
        return (
            <Link href={href} className={classes} {...rest}>
                {children}
            </Link>
        );
    }

    return (
        <button
            type={type}
            className={classes}
            disabled={loading || rest.disabled}
            aria-busy={loading || undefined}
            {...rest}
        >
            {loading && <Spinner />}
            {children}
        </button>
    );
};

export default Button;
