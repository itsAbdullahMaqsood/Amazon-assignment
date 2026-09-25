import { Skeleton } from "@/components/ui/Layout";

// Inside the account shell, so it only draws the page's own column.
const Loading = () => (
    <div aria-busy="true">
        <span className="sr-only">Loading your orders…</span>
        <Skeleton className="mt-8 h-8 w-48" />
        <Skeleton className="mt-6 h-10 w-full" />

        <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-card" />
            ))}
        </div>
    </div>
);

export default Loading;
