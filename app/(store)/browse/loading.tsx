// Skeleton shown while the catalog query runs.
const Loading = () => {
    return (
        <main className="max-w-screen-2xl mx-auto bg-slate-100 p-1 md:p-6" aria-busy="true">
            <span className="sr-only">Loading products…</span>

            <div className="flex flex-wrap gap-2 mt-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="w-40 md:w-56 h-10 rounded bg-slate-200 animate-pulse" />
                ))}
            </div>

            <div className="relative mt-4 grid grid-cols-5 gap-1 md:gap-5">
                <div className="col-span-5 md:col-span-1 h-[680px] rounded bg-white p-3 space-y-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-8 rounded bg-slate-200 animate-pulse" />
                    ))}
                </div>

                <div className="col-span-5 md:col-span-4">
                    <div className="h-10 w-full rounded bg-slate-200 animate-pulse" />

                    <div className="mt-6 flex flex-wrap items-start gap-4">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="w-[215px] p-1">
                                <div className="w-52 h-[300px] rounded bg-slate-200 animate-pulse" />
                                <div className="h-4 mt-2 rounded bg-slate-200 animate-pulse" />
                                <div className="h-4 mt-1 w-2/3 rounded bg-slate-200 animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Loading;
