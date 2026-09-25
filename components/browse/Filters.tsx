"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckIcon, ChevronDownIcon, StarIcon } from "@heroicons/react/20/solid";

import { cn } from "@/components/ui/cn";
import { swatchFor } from "@/lib/colors";
import { money } from "@/components/ui/Price";
import useBrowseQuery from "./useBrowseQuery";

const Section = ({ title, children, defaultOpen = true }: any) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <section className="border-b border-line py-4 last:border-b-0">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                className="flex w-full items-center justify-between text-left text-sm font-semibold text-fg cursor-pointer"
            >
                {title}
                <ChevronDownIcon className={cn("h-5 w-5 text-fg-subtle transition-transform", !open && "-rotate-90")} />
            </button>
            {open && <div className="mt-3">{children}</div>}
        </section>
    );
};

const CheckRow = ({ checked, onChange, label, count, swatch }: any) => (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-fg">
        <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 shrink-0 cursor-pointer accent-accent-ink" />
        {swatch !== undefined && (
            <span className="h-4 w-4 shrink-0 rounded-full ring-1 ring-line-strong" style={{ backgroundColor: swatch }} />
        )}
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <span className="text-xs text-fg-subtle tabular">{count}</span>
    </label>
);

// Price: two inputs and presets derived from the scope's own price range, so
// "Under $25" is never offered in a department where nothing costs that little.
const PriceFilter = ({ bounds }: any) => {
    const { get, set } = useBrowseQuery();
    const [min, max] = get("price").split("_");
    const [draft, setDraft] = useState({ min: min || "", max: max || "", key: get("price") });

    if (draft.key !== get("price")) {
        setDraft({ min: min || "", max: max || "", key: get("price") });
    }

    const presets = [
        [0, 25],
        [25, 100],
        [100, 500],
        [500, 0],
    ].filter(([low, high]) => (high === 0 ? bounds.max > low : bounds.min < high && bounds.max > low));

    const apply = (low: any, high: any) => set({ price: low || high ? `${low || ""}_${high || ""}` : "" });

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
                {presets.map(([low, high]) => {
                    const value = `${low || ""}_${high || ""}`;
                    const active = get("price") === value;
                    const label = high === 0 ? `${money(low).replace(".00", "")}+` : low === 0 ? `Under ${money(high).replace(".00", "")}` : `${money(low).replace(".00", "")}–${money(high).replace(".00", "")}`;

                    return (
                        <button
                            key={value}
                            type="button"
                            onClick={() => apply(active ? "" : low || "", active ? "" : high || "")}
                            aria-pressed={active}
                            className={cn(
                                "rounded-full border px-3 py-1 text-sm cursor-pointer",
                                active ? "border-accent-ink bg-accent-soft text-accent-ink" : "border-line-strong text-fg hover:border-fg-subtle"
                            )}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    apply(draft.min, draft.max);
                }}
                className="flex items-center gap-2"
            >
                <label className="sr-only" htmlFor="price-min">Minimum price</label>
                <input
                    id="price-min"
                    inputMode="decimal"
                    placeholder={`$${bounds.min}`}
                    value={draft.min}
                    onChange={(e) => setDraft({ ...draft, min: e.target.value.replace(/[^\d.]/g, "") })}
                    className="h-9 w-full min-w-0 rounded-control border border-line-strong bg-surface px-2.5 text-sm outline-none focus:border-accent-ink"
                />
                <span className="text-fg-subtle">–</span>
                <label className="sr-only" htmlFor="price-max">Maximum price</label>
                <input
                    id="price-max"
                    inputMode="decimal"
                    placeholder={`$${bounds.max}`}
                    value={draft.max}
                    onChange={(e) => setDraft({ ...draft, max: e.target.value.replace(/[^\d.]/g, "") })}
                    className="h-9 w-full min-w-0 rounded-control border border-line-strong bg-surface px-2.5 text-sm outline-none focus:border-accent-ink"
                />
                <button type="submit" className="h-9 shrink-0 rounded-control bg-ink-900 px-3 text-sm font-medium text-fg-inverse hover:bg-ink-700 cursor-pointer">
                    Go
                </button>
            </form>
        </div>
    );
};

const BrandFilter = ({ brands }: any) => {
    const { getList, toggle } = useBrowseQuery();
    const selected = getList("brand");
    const [query, setQuery] = useState("");
    const [showAll, setShowAll] = useState(false);

    const matching = brands.filter((brand: any) => brand.value.toLowerCase().includes(query.toLowerCase()));
    // Selected brands always stay visible, even beyond the first eight.
    const visible = showAll || query ? matching : matching.filter((brand: any, i: number) => i < 8 || selected.includes(brand.value));

    return (
        <div>
            {brands.length > 8 && (
                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Find a brand"
                    aria-label="Find a brand"
                    className="mb-2 h-9 w-full rounded-control border border-line-strong bg-surface px-2.5 text-sm outline-none focus:border-accent-ink"
                />
            )}
            {visible.map((brand: any) => (
                <CheckRow
                    key={brand.value}
                    label={brand.value}
                    count={brand.count}
                    checked={selected.includes(brand.value)}
                    onChange={() => toggle("brand", brand.value)}
                />
            ))}
            {!query && matching.length > visible.length && (
                <button type="button" onClick={() => setShowAll(true)} className="mt-1 text-sm text-link">
                    Show all {matching.length} brands
                </button>
            )}
        </div>
    );
};

// The whole filter column. On phones the same panel lives in a bottom sheet.
// `basePath` is /browse or /coupons: the deals page is the same grid scoped to
// listings that carry a discount, so it uses the same column.
const Filters = ({ facets, category, sub, search, basePath = "/browse", dealsOnly = false }: any) => {
    const { get, getList, set, toggle } = useBrowseQuery();
    const rating = Number(get("rating")) || 0;
    const colors = getList("color");
    const sizes = getList("size");
    const discount = Number(get("discount")) || 0;
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";

    return (
        <div>
            <Section title={category ? category.name : "Department"}>
                <ul className="space-y-0.5 text-sm">
                    {category ? (
                        <>
                            <li>
                                <Link href={`${basePath}?${search ? `search=${encodeURIComponent(search)}` : ""}`} className="block py-1 text-fg-muted hover:text-fg">
                                    ‹ All departments
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`${basePath}?category=${category.slug}${searchParam}`}
                                    className={cn("flex justify-between py-1", !sub ? "font-semibold text-fg" : "text-fg-muted hover:text-fg")}
                                >
                                    All {category.name}
                                </Link>
                            </li>
                            {facets.subs.map((entry: any) => (
                                <li key={entry.slug}>
                                    <Link
                                        href={`${basePath}?category=${category.slug}&sub=${entry.slug}${searchParam}`}
                                        aria-current={sub?.slug === entry.slug ? "page" : undefined}
                                        className={cn(
                                            "flex justify-between gap-2 py-1 pl-3",
                                            sub?.slug === entry.slug ? "font-semibold text-fg" : "text-fg-muted hover:text-fg"
                                        )}
                                    >
                                        <span>{entry.name}</span>
                                        <span className="text-xs text-fg-subtle tabular">{entry.count}</span>
                                    </Link>
                                </li>
                            ))}
                        </>
                    ) : (
                        facets.departments.map((entry: any) => (
                            <li key={entry.slug}>
                                <Link href={`${basePath}?category=${entry.slug}${searchParam}`} className="flex justify-between gap-2 py-1 text-fg-muted hover:text-fg">
                                    <span>{entry.name}</span>
                                    <span className="text-xs text-fg-subtle tabular">{entry.count}</span>
                                </Link>
                            </li>
                        ))
                    )}
                </ul>
            </Section>

            {dealsOnly && facets.discounts.length > 0 && (
                <Section title="Discount">
                    <div className="flex flex-wrap gap-1.5">
                        {facets.discounts.map((tier: any) => (
                            <button
                                key={tier.value}
                                type="button"
                                onClick={() => set({ discount: discount === tier.value ? "" : tier.value })}
                                aria-pressed={discount === tier.value}
                                className={cn(
                                    "rounded-full border px-3 py-1 text-sm cursor-pointer",
                                    discount === tier.value ? "border-accent-ink bg-accent-soft text-accent-ink" : "border-line-strong text-fg hover:border-fg-subtle"
                                )}
                            >
                                {tier.value}% or more
                                <span className="ml-1.5 text-xs text-fg-subtle tabular">{tier.count}</span>
                            </button>
                        ))}
                    </div>
                </Section>
            )}

            {facets.price.max > 0 && (
                <Section title="Price">
                    <PriceFilter bounds={facets.price} />
                </Section>
            )}

            <Section title="Customer rating">
                <div className="space-y-1">
                    {[4, 3].map((stars) => (
                        <button
                            key={stars}
                            type="button"
                            onClick={() => set({ rating: rating === stars ? "" : stars })}
                            aria-pressed={rating === stars}
                            className={cn(
                                "flex w-full items-center gap-2 rounded-control px-2 py-1.5 text-sm cursor-pointer",
                                rating === stars ? "bg-accent-soft text-accent-ink" : "text-fg hover:bg-surface-muted"
                            )}
                        >
                            <span className="flex">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <StarIcon key={i} className={cn("h-4 w-4", i <= stars ? "text-star" : "text-line-strong")} />
                                ))}
                            </span>
                            & up
                            {rating === stars && <CheckIcon className="ml-auto h-4 w-4" />}
                        </button>
                    ))}
                </div>
            </Section>

            {facets.brands.length > 1 && (
                <Section title="Brand">
                    <BrandFilter brands={facets.brands} />
                </Section>
            )}

            {facets.colors.length > 1 && (
                <Section title="Colour" defaultOpen={false}>
                    {facets.colors.map((color: any) => (
                        <CheckRow
                            key={color.value}
                            label={color.value}
                            count={color.count}
                            swatch={swatchFor(color.value)}
                            checked={colors.includes(color.value)}
                            onChange={() => toggle("color", color.value)}
                        />
                    ))}
                </Section>
            )}

            {facets.sizes.length > 0 && (
                <Section title="Size" defaultOpen={false}>
                    <div className="flex flex-wrap gap-1.5">
                        {facets.sizes.map((size: any) => (
                            <button
                                key={size.value}
                                type="button"
                                onClick={() => toggle("size", size.value)}
                                aria-pressed={sizes.includes(size.value)}
                                className={cn(
                                    "min-w-10 rounded-control border px-2.5 py-1 text-sm cursor-pointer",
                                    sizes.includes(size.value) ? "border-accent-ink bg-accent-soft text-accent-ink" : "border-line-strong text-fg hover:border-fg-subtle"
                                )}
                            >
                                {size.value}
                            </button>
                        ))}
                    </div>
                </Section>
            )}

            <Section title="Availability">
                <CheckRow label="In stock only" checked={get("stock") === "1"} onChange={() => set({ stock: get("stock") === "1" ? "" : "1" })} />
            </Section>
        </div>
    );
};

export default Filters;
