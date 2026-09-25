// Placeholder in the shape of the orders table while the query runs.
const OrdersTableSkeleton = () => (
    <div aria-busy="true" aria-label="Loading orders" className="animate-pulse">
        <div className="h-4 w-48 bg-line rounded mb-3" />
        <div className="rounded-xl border border-line bg-surface">
            {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="flex gap-4 px-4 py-4 border-t border-line first:border-t-0">
                    <div className="h-4 w-20 bg-line rounded" />
                    <div className="h-4 w-24 bg-line rounded" />
                    <div className="h-4 flex-1 bg-line rounded" />
                    <div className="h-4 w-16 bg-line rounded" />
                    <div className="h-4 w-20 bg-line rounded" />
                </div>
            ))}
        </div>
    </div>
);

export default OrdersTableSkeleton;
