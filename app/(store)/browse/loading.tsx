import { Container, Skeleton } from "@/components/ui/Layout";

// Shown while the catalogue query runs: the page's own shape, so nothing jumps
// when the results arrive.
const Loading = () => (
    <main aria-busy="true">
        <span className="sr-only">Loading products…</span>
        <Container className="pt-5 md:pt-6">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="mt-4 h-8 w-64" />
            <Skeleton className="mt-2 h-4 w-24" />

            <div className="mt-6 grid gap-8 lg:grid-cols-[15rem_1fr]">
                <div className="hidden space-y-4 lg:block">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
                <div>
                    <Skeleton className="h-9 w-full" />
                    <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i}>
                                <Skeleton className="aspect-square w-full rounded-card" />
                                <Skeleton className="mt-3 h-4 w-full" />
                                <Skeleton className="mt-2 h-4 w-2/3" />
                                <Skeleton className="mt-3 h-5 w-20" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Container>
    </main>
);

export default Loading;
