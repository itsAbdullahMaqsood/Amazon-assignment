import { Skeleton } from "@/components/ui/Layout";

// Markaz Movies loads on a dark surface, so its skeleton has to as well —
// otherwise the page flashes white and then goes black.
const Loading = () => (
    <main aria-busy="true" className="min-h-[80vh] bg-ink-950">
        <span className="sr-only">Loading Markaz Movies…</span>

        <div className="border-b border-fg-inverse/10">
            <div className="mx-auto flex max-w-page items-center gap-6 px-4 py-4 sm:px-6 lg:px-8">
                <Skeleton className="h-6 w-36 bg-fg-inverse/10" />
                <Skeleton className="h-4 w-16 bg-fg-inverse/10" />
            </div>
        </div>

        <Skeleton className="h-[360px] w-full rounded-none bg-fg-inverse/5 sm:h-[460px] lg:h-[520px]" />

        <div className="mx-auto max-w-page px-4 pt-9 sm:px-6 lg:px-8">
            <Skeleton className="h-6 w-48 bg-fg-inverse/10" />
            <div className="mt-3 flex gap-3 overflow-hidden">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-2/3 w-36 shrink-0 bg-fg-inverse/10 sm:w-40" />
                ))}
            </div>
        </div>
    </main>
);

export default Loading;
