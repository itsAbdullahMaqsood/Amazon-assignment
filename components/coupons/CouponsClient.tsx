"use client";

import useBrowseQuery from "@/components/browse/useBrowseQuery";
import Pagination from "@/components/ui/Pagination";
import ChipRow from "./ChipRow";
import CouponFilters from "./CouponFilters";
import CouponCard from "./CouponCard";

const CouponsClient = ({
    products,
    categories,
    subCategories,
    chips,
    ceiling,
    total,
    page,
    paginationCount,
}: any) => {
    const { current, filter } = useBrowseQuery();

    const clear = () =>
        filter({ category: "", sub: "", rating: "", price: "", discount: "", page: "" });

    return (
        <div className="max-w-[1500px] mx-auto px-4 py-4">
            <ChipRow
                chips={chips}
                active={current.sub || current.category || ""}
                onSelect={(entry: any) =>
                    // A department chip filters on the category, an aisle chip on the
                    // subcategory, and picking either clears the other.
                    filter(
                        entry.kind === "sub"
                            ? { sub: current.sub === entry._id ? "" : entry._id, category: "" }
                            : { category: current.category === entry._id ? "" : entry._id, sub: "" }
                    )
                }
                onClear={clear}
            />

            <div className="mt-4 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
                <CouponFilters
                    categories={categories}
                    subCategories={subCategories}
                    current={current}
                    ceiling={ceiling}
                    filter={filter}
                    onClear={clear}
                />

                <section>
                    <p className="sr-only" aria-live="polite">
                        {total} coupon {total === 1 ? "deal" : "deals"}
                    </p>

                    {products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-x-5 gap-y-8">
                            {products.map((product: any) => (
                                <CouponCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-center gap-3 bg-white rounded p-10">
                            <p className="text-xl font-semibold">No coupons match these filters</p>
                            <p className="text-sm text-slate-600">
                                Try a different department, or widen the price range.
                            </p>
                            <button
                                onClick={clear}
                                className="px-6 py-2 rounded-full bg-accent text-ink-900 cursor-pointer"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}

                    <Pagination
                        page={page}
                        count={paginationCount}
                        onChange={(next: number) => filter({ page: next })}
                    />
                </section>
            </div>
        </div>
    );
};

export default CouponsClient;
