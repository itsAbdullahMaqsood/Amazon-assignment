import { Container, Skeleton } from "@/components/ui/Layout";

// The product page's own shape while its query runs, so the gallery and the
// decision panel do not jump into place.
const Loading = () => (
    <main aria-busy="true">
        <span className="sr-only">Loading this product…</span>
        <Container className="pt-5 md:pt-6">
            <Skeleton className="h-4 w-64" />

            <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_22rem]">
                <div className="grid gap-6 md:grid-cols-[4rem_1fr]">
                    <div className="hidden gap-2 md:grid">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-square w-16 rounded-card" />
                        ))}
                    </div>
                    <Skeleton className="aspect-square w-full rounded-panel" />
                </div>

                <div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="mt-3 h-7 w-full" />
                    <Skeleton className="mt-2 h-7 w-2/3" />
                    <Skeleton className="mt-4 h-5 w-40" />
                    <Skeleton className="mt-6 h-9 w-32" />
                    <Skeleton className="mt-6 h-11 w-full rounded-card" />
                    <Skeleton className="mt-2 h-11 w-full rounded-card" />
                </div>
            </div>
        </Container>
    </main>
);

export default Loading;
