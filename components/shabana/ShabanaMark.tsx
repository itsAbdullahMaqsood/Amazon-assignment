import { SparklesIcon } from "@heroicons/react/24/solid";

import { cn } from "@/components/ui/cn";

// Shabana's avatar: a purple disc with a spark. Used in the panel, on the home
// hero and wherever a product page offers to ask her.
const ShabanaMark = ({ size = "md", className = "" }: any) => (
    <span
        aria-hidden="true"
        className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full bg-accent text-ink-900",
            size === "sm" ? "h-6 w-6" : size === "lg" ? "h-12 w-12" : "h-9 w-9",
            className
        )}
    >
        <SparklesIcon className={size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-6 w-6" : "h-5 w-5"} />
    </span>
);

export default ShabanaMark;
