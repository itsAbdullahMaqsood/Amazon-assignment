"use client";

import { useState } from "react";
import Link from "next/link";
import { AdjustmentsHorizontalIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { useAppDispatch } from "@/redux/hooks";
import { openAssistant } from "@/redux/slices/AssistantSlice";
import ProductCard from "@/components/product/ProductCard";
import Button from "@/components/ui/Button";
import Sheet from "@/components/ui/Sheet";
import { Breadcrumbs, Container, EmptyState } from "@/components/ui/Layout";
import { cn } from "@/components/ui/cn";
import { money } from "@/components/ui/Price";
import { sortOptions } from "@/lib/browseOptions";
import Pagination from "@/components/ui/Pagination";
import Filters from "./Filters";
import useBrowseQuery from "./useBrowseQuery";

// Everything a filter has done, as removable chips, so the shopper can always
// see why the results look the way they do.
const useAppliedFilters = () => {
    const { get, getList, set } = useBrowseQuery();
    const chips: { key: string; label: string; remove: () => void }[] = [];
    const [min, max] = get("price").split("_");

    if (get("discount")) chips.push({ key: "discount", label: `${get("discount")}% off or more`, remove: () => set({ discount: "" }) });

    if (min || max) {
        chips.push({
            key: "price",
            label: min && max ? `${money(min)} – ${money(max)}` : min ? `${money(min)} and up` : `Under ${money(max)}`,
            remove: () => set({ price: "" }),
        });
    }
    if (get("rating")) chips.push({ key: "rating", label: `${get("rating")}★ & up`, remove: () => set({ rating: "" }) });
    getList("brand").forEach((brand) =>
        chips.push({ key: `brand-${brand}`, label: brand, remove: () => set({ brand: getList("brand").filter((b) => b !== brand) }) })
    );
    getList("color").forEach((color) =>
        chips.push({ key: `color-${color}`, label: color, remove: () => set({ color: getList("color").filter((c) => c !== color) }) })
    );
    getList("size").forEach((size) =>
        chips.push({ key: `size-${size}`, label: `Size ${size}`, remove: () => set({ size: getList("size").filter((s) => s !== size) }) })
    );
    if (get("stock") === "1") chips.push({ key: "stock", label: "In stock", remove: () => set({ stock: "" }) });

    const clearAll = () => set({ price: "", rating: "", brand: "", color: "", size: "", stock: "", discount: "" });

    return { chips, clearAll };
};

// One grid, two scopes. /browse is the whole catalogue; /coupons is the same
// grid narrowed to listings that carry a discount, so the filters, the chips and
// the pagination behave identically in both and a shopper only learns them once.
const BrowseView = ({ data, children }: any) => {
    const dispatch = useAppDispatch();
    const { set, pending } = useBrowseQuery();
    const { chips, clearAll } = useAppliedFilters();
    const [sheetOpen, setSheetOpen] = useState(false);
    const { query, category, sub, total, products, facets, page, pageCount, dealsOnly } = { ...data, page: data.query.page };

    const base = dealsOnly ? "/coupons" : "/browse";
    const noun = dealsOnly ? "deal" : "result";
    const scopeName = sub?.name || category?.name;
    const title = query.search
        ? `“${query.search}”`
        : dealsOnly
          ? scopeName ? `${scopeName} deals` : "Deals"
          : scopeName || "All departments";
    const first = total ? (page - 1) * 24 + 1 : 0;
    const last = Math.min(page * 24, total);

    const crumbs = [
        { label: "Home", href: "/" },
        { label: dealsOnly ? "Deals" : "All departments", href: base },
        ...(category ? [{ label: category.name, href: `${base}?category=${category.slug}` }] : []),
        ...(sub ? [{ label: sub.name, href: `${base}?category=${category.slug}&sub=${sub.slug}` }] : []),
        ...(query.search ? [{ label: `Search: ${query.search}` }] : []),
    ];

    const sortSelect = (
        <label className="flex items-center gap-2 text-sm">
            <span className="hidden text-fg-muted sm:inline">Sort by</span>
            <select
                value={query.sort}
                onChange={(e) => set({ sort: e.target.value })}
                aria-label="Sort by"
                className="h-9 cursor-pointer rounded-control border border-line-strong bg-surface pl-2.5 pr-8 text-sm outline-none focus:border-accent-ink"
            >
                {sortOptions
                    .filter((option) => (!option.searchOnly || query.search) && (!option.dealsOnly || dealsOnly))
                    .map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
            </select>
        </label>
    );

    return (
        <main>
            <Container className="pt-5 md:pt-6">
                <Breadcrumbs items={crumbs} />

                <div className="mt-3 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                            {query.search ? <>Results for {title}</> : title}
                        </h1>
                        <p className="mt-1 text-sm text-fg-muted" aria-live="polite">
                            {total === 0 ? `No ${noun}s` : `${total} ${noun}${total === 1 ? "" : "s"}`}
                            {query.search && scopeName && <> in {scopeName}</>}
                            {pageCount > 1 && total > 0 && <> · showing {first}–{last}</>}
                        </p>
                    </div>
                </div>

                {children}

                {/* Sub-categories as chips: the quickest way to narrow a department on a phone. */}
                {category && facets.subs.length > 1 && (
                    <div className="scroll-row -mx-4 mt-4 gap-2 px-4 lg:hidden">
                        {facets.subs.map((entry: any) => (
                            <Link
                                key={entry.slug}
                                href={`${base}?category=${category.slug}${sub?.slug === entry.slug ? "" : `&sub=${entry.slug}`}${query.search ? `&search=${encodeURIComponent(query.search)}` : ""}`}
                                className={cn(
                                    "rounded-full border px-3 py-1.5 text-sm whitespace-nowrap",
                                    sub?.slug === entry.slug ? "border-accent-ink bg-accent-soft text-accent-ink" : "border-line-strong bg-surface text-fg"
                                )}
                            >
                                {entry.name}
                            </Link>
                        ))}
                    </div>
                )}

                <div className="mt-6 grid gap-8 lg:grid-cols-[15rem_1fr]">
                    <aside aria-label="Filters" className="hidden lg:block">
                        <div className="sticky top-4 max-h-[calc(100dvh-2rem)] overflow-y-auto pr-2">
                            <Filters facets={facets} category={category} sub={sub} search={query.search} basePath={base} dealsOnly={dealsOnly} />
                        </div>
                    </aside>

                    <div>
                        <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                            <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)} className="lg:hidden">
                                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                                Filters{chips.length > 0 && ` (${chips.length})`}
                            </Button>

                            <div className="hidden min-w-0 flex-1 flex-wrap items-center gap-2 lg:flex">
                                {chips.length === 0 && <span className="text-sm text-fg-subtle">No filters applied</span>}
                                {chips.map((chip) => (
                                    <button
                                        key={chip.key}
                                        type="button"
                                        onClick={chip.remove}
                                        className="flex items-center gap-1 rounded-full bg-accent-soft py-1 pl-3 pr-2 text-sm text-accent-ink hover:bg-accent cursor-pointer"
                                    >
                                        {chip.label}
                                        <XMarkIcon className="h-4 w-4" aria-label="remove" />
                                    </button>
                                ))}
                                {chips.length > 1 && (
                                    <button type="button" onClick={clearAll} className="text-sm text-link">
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {sortSelect}
                        </div>

                        {chips.length > 0 && (
                            <div className="scroll-row -mx-4 mt-3 gap-2 px-4 lg:hidden">
                                {chips.map((chip) => (
                                    <button
                                        key={chip.key}
                                        type="button"
                                        onClick={chip.remove}
                                        className="flex items-center gap-1 whitespace-nowrap rounded-full bg-accent-soft py-1 pl-3 pr-2 text-sm text-accent-ink"
                                    >
                                        {chip.label}
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className={cn("transition-opacity", pending && "opacity-50")}>
                            {products.length > 0 ? (
                                <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
                                    {products.map((product: any, i: number) => (
                                        <li key={product._id}>
                                            <ProductCard product={product} priority={i < 4} />
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <EmptyState
                                    className="mt-6"
                                    icon={MagnifyingGlassIcon}
                                    title={query.search ? `Nothing matched “${query.search}”` : dealsOnly ? "No deals match these filters" : "Nothing matches these filters"}
                                    description={
                                        chips.length
                                            ? "Your filters left no products. Remove one to widen the search."
                                            : dealsOnly
                                              ? `Nothing in ${scopeName || "the store"} is discounted right now. Deals come and go with the catalogue.`
                                              : scopeName
                                                ? `Nothing in ${scopeName} matched. Try every department, or describe what you need to Shabana.`
                                                : "Check the spelling, try a more general word, or describe what you need to Shabana."
                                    }
                                    action={
                                        <>
                                            {chips.length > 0 && <Button onClick={clearAll}>Clear filters</Button>}
                                            {query.search && category && (
                                                <Button variant="outline" href={`${base}?search=${encodeURIComponent(query.search)}`}>
                                                    Search all departments
                                                </Button>
                                            )}
                                            {query.search && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => dispatch(openAssistant({ prompt: `I'm looking for ${query.search}` }))}
                                                >
                                                    Ask Shabana
                                                </Button>
                                            )}
                                        </>
                                    }
                                />
                            )}
                        </div>

                        <Pagination page={page} count={pageCount} onChange={(n: number) => set({ page: n })} className="mt-10" />
                    </div>
                </div>
            </Container>

            <Sheet
                open={sheetOpen}
                onClose={() => setSheetOpen(false)}
                side="bottom"
                title="Filters"
                footer={
                    <div className="flex gap-2">
                        {chips.length > 0 && (
                            <Button variant="outline" onClick={clearAll} block>
                                Clear all
                            </Button>
                        )}
                        <Button onClick={() => setSheetOpen(false)} block>
                            Show {total} {noun}{total === 1 ? "" : "s"}
                        </Button>
                    </div>
                }
            >
                <Filters facets={facets} category={category} sub={sub} search={query.search} basePath={base} dealsOnly={dealsOnly} />
            </Sheet>
        </main>
    );
};

export default BrowseView;
