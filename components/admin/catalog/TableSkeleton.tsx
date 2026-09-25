// Shown by the loading.tsx files while the server fetches the list.
const TableSkeleton = ({ title, rows = 6 }: any) => (
    <div aria-busy="true" aria-live="polite">
        <h1 className="text-2xl font-bold text-fg mb-6">{title}</h1>
        <span className="sr-only">Loading {title}…</span>
        <div className="h-18 rounded-xl border border-line bg-surface mb-4 animate-pulse" />
        <div className="rounded-xl border border-line bg-surface overflow-hidden">
            <div className="h-10 bg-surface-muted" />
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="h-12 border-t border-line px-4 flex items-center gap-4 animate-pulse">
                    <div className="h-3 w-1/4 rounded bg-line" />
                    <div className="h-3 w-1/5 rounded bg-surface-muted" />
                    <div className="h-3 w-12 rounded bg-surface-muted ml-auto" />
                </div>
            ))}
        </div>
    </div>
);

export default TableSkeleton;
