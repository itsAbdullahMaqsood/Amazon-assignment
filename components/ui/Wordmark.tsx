import { cn } from "./cn";

// The Markaz wordmark is set type, not an image: lowercase "markaz" in the
// display face with a light purple dot, the centre the name means.
const Wordmark = ({ tone = "inverse", size = "md", className = "" }: any) => (
    <span
        className={cn(
            "inline-flex items-baseline font-display font-bold tracking-tight leading-none select-none",
            size === "sm" ? "text-xl" : size === "lg" ? "text-4xl" : "text-2xl",
            tone === "inverse" ? "text-fg-inverse" : "text-fg",
            className
        )}
    >
        markaz
        <span
            aria-hidden="true"
            className={cn(
                "ml-0.5 inline-block rounded-full bg-accent",
                size === "sm" ? "h-1.5 w-1.5" : size === "lg" ? "h-2.5 w-2.5" : "h-2 w-2"
            )}
        />
    </span>
);

export default Wordmark;
