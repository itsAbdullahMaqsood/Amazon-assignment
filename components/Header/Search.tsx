"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const Search = ({ searchHandler }: any) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState<string>(searchParams.get("search") || "");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const [highlighted, setHighlighted] = useState<number>(-1);
    const [departments, setDepartments] = useState<any[]>([]);
    // Holds a slug, or an id when /browse was reached from the sidebar; "" is All.
    const urlCategory = searchParams.get("category") || "";
    const [department, setDepartment] = useState<string>(urlCategory);
    const [lastUrlCategory, setLastUrlCategory] = useState<string>(urlCategory);

    // Follow the URL when the browse sidebar changes the category.
    if (urlCategory !== lastUrlCategory) {
        setLastUrlCategory(urlCategory);
        setDepartment(urlCategory);
    }
    const containerRef = useRef<HTMLDivElement | null>(null);
    // The header renders one search bar for desktop and one for mobile.
    const uid = useId();

    useEffect(() => {
        const controller = new AbortController();

        fetch("/api/search/departments", { signal: controller.signal })
            .then((res) => res.json())
            .then((data) => setDepartments(data.departments || []))
            .catch(() => {
                // aborted or offline: the picker stays at All
            });

        return () => controller.abort();
    }, []);

    const selected = departments.find((d) => d.slug === department || d.id === department);
    const departmentSlug = selected?.slug || "";

    // Suggestions come from the catalog, debounced so typing is not a request each keystroke.
    useEffect(() => {
        if (query.trim().length < 2) {
            return;
        }

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const params = new URLSearchParams({ q: query });

                if (departmentSlug) {
                    params.set("category", departmentSlug);
                }

                const res = await fetch(`/api/search/suggestions?${params.toString()}`, {
                    signal: controller.signal,
                });
                const data = await res.json();
                setSuggestions(data.suggestions || []);
            } catch {
                // aborted or offline: leave the previous list alone
            }
        }, 250);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query, departmentSlug]);

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    // On /browse the search updates the existing query string in place, so the
    // filters already applied there survive.
    const runSearch = (value: string) => {
        setOpen(false);
        setHighlighted(-1);

        if (pathname === "/browse") {
            const params = new URLSearchParams(searchParams.toString());

            if (value.trim()) {
                params.set("search", value);
            } else {
                params.delete("search");
            }

            if (departmentSlug) {
                params.set("category", departmentSlug);
            } else {
                params.delete("category");
            }

            params.delete("page");
            router.push(`/browse?${params.toString()}`);

            if (searchHandler) {
                searchHandler(value);
            }

            return;
        }

        const params = new URLSearchParams();

        if (value.trim().length > 1) {
            params.set("search", value);
        }

        if (departmentSlug) {
            params.set("category", departmentSlug);
        }

        // An empty search with a department picked opens that department.
        if (params.size) {
            router.push(`/browse?${params.toString()}`);
        }
    };

    // Derived rather than cleared from the effect: a short query simply shows nothing.
    const visible = query.trim().length < 2 ? [] : suggestions;

    const submitHandler = (e: any) => {
        e.preventDefault();
        runSearch(query);
    };

    const keyHandler = (e: any) => {
        if (!open || !visible.length) {
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlighted((index) => (index + 1) % visible.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlighted((index) => (index <= 0 ? visible.length - 1 : index - 1));
        } else if (e.key === "Enter" && highlighted >= 0) {
            e.preventDefault();
            const picked = visible[highlighted];
            setQuery(picked.name);
            runSearch(picked.name);
        } else if (e.key === "Escape") {
            setOpen(false);
            setHighlighted(-1);
        }
    };

    return (
        <div ref={containerRef} className="relative flex-grow w-full">
            <form
                onSubmit={submitHandler}
                role="search"
                className="flex items-stretch h-10 grow rounded-md overflow-hidden bg-white focus-within:ring-[3px] focus-within:ring-[#f90]"
            >
                {/* The native select sits invisibly over its label, so the control
                    sizes to the picked department the way Amazon's does. */}
                <div className="relative hidden md:flex items-center shrink-0 max-w-48 gap-1 pl-3 pr-2 bg-[#e6e6e6] hover:bg-[#d4d4d4] text-xs text-[#555] hover:text-black border-r border-[#cdcdcd] cursor-pointer">
                    <span className="truncate" aria-hidden="true">
                        {selected?.name || "All"}
                    </span>
                    <ChevronDownIcon className="h-3 w-3 shrink-0 stroke-[3]" aria-hidden="true" />
                    <label htmlFor={`${uid}-department`} className="sr-only">
                        Search in
                    </label>
                    <select
                        id={`${uid}-department`}
                        value={selected ? selected.slug : ""}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer text-sm"
                    >
                        <option value="">All Departments</option>
                        {departments.map((d) => (
                            <option key={d.id} value={d.slug}>
                                {d.name}
                            </option>
                        ))}
                    </select>
                </div>

                <label htmlFor={`${uid}-input`} className="sr-only">
                    Search Amazon
                </label>
                <input
                    id={`${uid}-input`}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                        setHighlighted(-1);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={keyHandler}
                    placeholder="Search Amazon"
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={open && visible.length > 0}
                    aria-controls={`${uid}-suggestions`}
                    aria-autocomplete="list"
                    aria-activedescendant={highlighted >= 0 ? `${uid}-suggestion-${highlighted}` : undefined}
                    className="grow shrink w-full min-w-0 px-3 text-[15px] outline-none text-black placeholder:text-[#6f7373]"
                />

                <button
                    type="submit"
                    aria-label="Search"
                    className="flex items-center justify-center w-11 shrink-0 bg-amazon-orange hover:bg-[#f3a847] cursor-pointer"
                >
                    <MagnifyingGlassIcon className="h-6 w-6 text-amazon-blue_dark stroke-2" />
                </button>
            </form>

            {open && visible.length > 0 && (
                <ul
                    id={`${uid}-suggestions`}
                    role="listbox"
                    aria-label="Search suggestions"
                    className="absolute top-full left-0 right-0 z-50 bg-white text-black shadow-lg rounded-b max-h-80 overflow-y-auto"
                >
                    {visible.map((suggestion: any, i: number) => (
                        <li
                            key={suggestion.slug}
                            id={`${uid}-suggestion-${i}`}
                            role="option"
                            aria-selected={i === highlighted}
                            onMouseEnter={() => setHighlighted(i)}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                setQuery(suggestion.name);
                                runSearch(suggestion.name);
                            }}
                            className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${
                                i === highlighted ? "bg-slate-100" : ""
                            }`}
                        >
                            <MagnifyingGlassIcon className="h-4 w-4 text-slate-500 shrink-0" />
                            <span className="truncate">{suggestion.name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Search;
