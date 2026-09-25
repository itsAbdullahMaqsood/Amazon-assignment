"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

import ProductCard from "@/components/Home/productCard/ProductCard";
import useBrowseQuery from "./useBrowseQuery";
import FilterSection from "./FilterSection";
import CheckboxGrid from "./CheckboxGrid";
import ColorsFilter from "./ColorsFilter";
import ParentCategory from "./ParentCategory";
import HeadingFilter from "./headingFilter/HeadingFilter";
import Pagination from "./Pagination";

const BrowseClient = ({
    products,
    categories,
    subCategories,
    colors,
    brands,
    sizes,
    styles,
    materials,
    total,
    page,
    pageSize,
    paginationCount,
}: any) => {
    const { current, filter, filterDebounced, replaceQuery } = useBrowseQuery();

    const activeCategory = current.category || "";
    const activeFilterCount = Object.keys(current).filter((key) => key !== "page").length;
    const selectedCategory = categories.find((c: any) => c._id === activeCategory);

    const priceHandler = (value: string, type: "min" | "max") => {
        const [min, max] = String(current.price || "").split("_");
        const next = type === "min" ? `${value}_${max || ""}` : `${min || ""}_${value}`;

        filterDebounced({ price: next === "_" ? "" : next }, 500);
    };

    const multiPriceHandler = (min: string, max: string) => filter({ price: `${min}_${max}` });

    const genderHandler = (value: string) => {
        if (value === "Unisex") {
            filter({ gender: "" });
            return;
        }

        filter({ gender: replaceQuery("gender", value).result });
    };

    const firstResult = total === 0 ? 0 : pageSize * (page - 1) + 1;
    const lastResult = Math.min(pageSize * page, total);

    return (
        <main className="max-w-screen-2xl mx-auto bg-slate-100 p-1 md:p-6 gap-2">
            <div>
                <nav aria-label="Breadcrumb" className="flex items-center text-sm">
                    <Link href="/" className="hover:underline">
                        Home
                    </Link>
                    <ChevronRightIcon className="h-3 mx-1" />
                    <span>Browse</span>
                    {selectedCategory && (
                        <>
                            <ChevronRightIcon className="h-3 mx-1" />
                            <span className="font-semibold">{selectedCategory.name}</span>
                        </>
                    )}
                </nav>

                <div className="flex flex-wrap gap-2 mt-3">
                    {categories.map((category: any) => (
                        <button
                            key={category._id}
                            onClick={() =>
                                filter({ category: activeCategory === category._id ? "" : category._id })
                            }
                            aria-pressed={activeCategory === category._id}
                            className={`w-40 md:w-56 h-10 border border-slate-300 rounded flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-ink-800 hover:text-white hover:scale-95 hover:border-ink-900 ${
                                activeCategory === category._id
                                    ? "bg-ink-800 text-white"
                                    : "bg-white"
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative mt-4 grid grid-cols-5 gap-1 md:gap-5">
                {/* Sticky rather than fixed: a fixed sidebar needs a hard-coded
                    width, which stops matching its grid column as the viewport
                    changes and paints over the results. Sticky keeps the column
                    width it already has. */}
                <aside
                    className="col-span-5 md:col-span-1 md:sticky md:top-2 md:self-start max-h-[680px] md:max-h-[calc(100vh-1rem)] overflow-y-auto bg-white rounded p-3"
                    aria-label="Filters"
                >
                    <button
                        onClick={() => filter({})}
                        className="w-full py-2 rounded bg-ink-800 text-white hover:scale-95 transition duration-300 cursor-pointer"
                    >
                        Clear All ({activeFilterCount})
                    </button>

                    <FilterSection title="Category" defaultOpen>
                        {categories.map((category: any) => (
                            <ParentCategory
                                key={category._id}
                                category={category}
                                subCategories={subCategories}
                                activeCategory={activeCategory}
                                filter={filter}
                            />
                        ))}
                    </FilterSection>

                    <FilterSection title="Sizes">
                        <CheckboxGrid
                            values={sizes}
                            queryName="size"
                            replaceQuery={replaceQuery}
                            filter={filter}
                        />
                    </FilterSection>

                    <FilterSection title="Colors">
                        <ColorsFilter colors={colors} replaceQuery={replaceQuery} filter={filter} />
                    </FilterSection>

                    <FilterSection title="Brands">
                        <CheckboxGrid
                            values={brands}
                            queryName="brand"
                            replaceQuery={replaceQuery}
                            filter={filter}
                            columns={1}
                        />
                    </FilterSection>

                    <FilterSection title="Styles">
                        <CheckboxGrid
                            values={styles}
                            queryName="style"
                            replaceQuery={replaceQuery}
                            filter={filter}
                            columns={1}
                        />
                    </FilterSection>

                    <FilterSection title="Materials">
                        <CheckboxGrid
                            values={materials}
                            queryName="material"
                            replaceQuery={replaceQuery}
                            filter={filter}
                            columns={1}
                        />
                    </FilterSection>

                    <FilterSection title="Gender">
                        <div className="grid grid-cols-1 gap-1">
                            {["Men", "Women", "Unisex"].map((value) => (
                                <label
                                    key={value}
                                    className="flex items-center gap-2 text-sm cursor-pointer hover:font-semibold"
                                >
                                    <input
                                        type="checkbox"
                                        checked={
                                            value === "Unisex"
                                                ? !current.gender
                                                : replaceQuery("gender", value).active
                                        }
                                        onChange={() => genderHandler(value)}
                                        className="cursor-pointer"
                                    />
                                    {value}
                                </label>
                            ))}
                        </div>
                    </FilterSection>
                </aside>

                <section className="col-span-5 md:col-span-4">
                    <HeadingFilter
                        current={current}
                        filter={filter}
                        priceHandler={priceHandler}
                        multiPriceHandler={multiPriceHandler}
                    />

                    <p className="mt-3 text-sm text-slate-600" aria-live="polite">
                        {total === 0
                            ? "0 results"
                            : `${firstResult}-${lastResult} of ${total} result${total === 1 ? "" : "s"}`}
                        {current.search && (
                            <>
                                {" for "}
                                <span className="text-accent-deep font-semibold">
                                    &quot;{current.search}&quot;
                                </span>
                            </>
                        )}
                    </p>

                    {products.length > 0 ? (
                        <div className="mt-6 flex flex-wrap items-start gap-4">
                            {products.map((product: any) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="mt-10 flex flex-col items-center text-center gap-3 bg-white rounded p-10">
                            <p className="text-xl font-semibold">No products match these filters</p>
                            <p className="text-sm text-slate-600">
                                Try removing a filter, or widening the price range.
                            </p>
                            <button
                                onClick={() => filter({})}
                                className="px-6 py-2 rounded-full bg-accent text-ink-900 cursor-pointer"
                            >
                                Clear all filters
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
        </main>
    );
};

export default BrowseClient;
