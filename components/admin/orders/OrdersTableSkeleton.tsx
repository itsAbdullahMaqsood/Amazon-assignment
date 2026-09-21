// Placeholder in the shape of the orders table while the query runs.
const OrdersTableSkeleton = () => (
    <div aria-busy="true" aria-label="Loading orders" className="animate-pulse">
        <div className="h-4 w-48 bg-slate-200 rounded mb-3" />
        <div className="rounded-xl border border-slate-200 bg-white">
            {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="flex gap-4 px-4 py-4 border-t border-slate-100 first:border-t-0">
                    <div className="h-4 w-20 bg-slate-200 rounded" />
                    <div className="h-4 w-24 bg-slate-200 rounded" />
                    <div className="h-4 flex-1 bg-slate-200 rounded" />
                    <div className="h-4 w-16 bg-slate-200 rounded" />
                    <div className="h-4 w-20 bg-slate-200 rounded" />
                </div>
            ))}
        </div>
    </div>
);

export default OrdersTableSkeleton;
