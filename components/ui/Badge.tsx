import { cn } from "./cn";

const tones: Record<string, string> = {
    neutral: "bg-surface-muted text-fg-muted",
    accent: "bg-accent-soft text-accent-ink",
    solid: "bg-accent text-fg",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    ink: "bg-ink-900 text-fg-inverse",
};

const Badge = ({ tone = "neutral", className = "", children, ...rest }: any) => (
    <span
        className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
            tones[tone],
            className
        )}
        {...rest}
    >
        {children}
    </span>
);

export default Badge;
