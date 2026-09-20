"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const Search = ({ searchHandler }: any) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState<string>(searchParams.get("search") || "");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const [highlighted, setHighlighted] = useState<number>(-1);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Suggestions come from the catalog, debounced so typing is not a request each keystroke.
    useEffect(() => {
        if (query.trim().length < 2) {
            return;
        }

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`, {
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
    }, [query]);

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

            params.delete("page");
            router.push(`/browse?${params.toString()}`);

            if (searchHandler) {
                searchHandler(value);
            }

            return;
        }

        if (value.trim().length > 1) {
            router.push(`/browse?search=${encodeURIComponent(value)}`);
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
                className="flex items-center grow bg-amazon-orange rounded-md overflow-hidden"
            >
                <label htmlFor="search-department" className="sr-only">
                    Search department
                </label>
                <select
                    id="search-department"
                    className="hidden md:inline h-11 w-16 bg-gray-200 text-xs text-gray-600 border-r border-gray-300 outline-none cursor-pointer px-2"
                >
                    <option value="All">All</option>
                    <option value="Computers">Computers</option>
                    <option value="Arts & Crafts">Arts &amp; Crafts</option>
                    <option value="Baby">Baby</option>
                    <option value="Book">Book</option>
                </select>

                <label htmlFor="search-input" className="sr-only">
                    Search Amazon
                </label>
                <input
                    id="search-input"
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
                    aria-controls="search-suggestions"
                    aria-autocomplete="list"
                    aria-activedescendant={highlighted >= 0 ? `suggestion-${highlighted}` : undefined}
                    className="h-11 grow shrink w-full px-3 outline-none text-black"
                />

                <button type="submit" aria-label="Search" className="px-2 cursor-pointer">
                    <MagnifyingGlassIcon className="h-8 w-8 text-amazon-blue_dark" />
                </button>
            </form>

            {open && visible.length > 0 && (
                <ul
                    id="search-suggestions"
                    role="listbox"
                    aria-label="Search suggestions"
                    className="absolute top-full left-0 right-0 z-50 bg-white text-black shadow-lg rounded-b max-h-80 overflow-y-auto"
                >
                    {visible.map((suggestion: any, i: number) => (
                        <li
                            key={suggestion.slug}
                            id={`suggestion-${i}`}
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
