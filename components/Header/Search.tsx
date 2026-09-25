"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDownIcon, MagnifyingGlassIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";

import { money } from "@/components/ui/Price";
import { cn } from "@/components/ui/cn";

// Bolds the part of a suggestion that matches what was typed.
const Highlight = ({ text, query }: any) => {
    const index = text.toLowerCase().indexOf(query.toLowerCase());

    if (!query || index < 0) return <>{text}</>;

    return (
        <>
            {text.slice(0, index)}
            <mark className="bg-transparent font-semibold text-fg">{text.slice(index, index + query.length)}</mark>
            {text.slice(index + query.length)}
        </>
    );
};

const Search = ({ departments = [], onNavigate }: any) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const uid = useId();

    const [query, setQuery] = useState<string>(searchParams.get("search") || "");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const [highlighted, setHighlighted] = useState<number>(-1);

    // The picker holds a department slug; "" searches everything. It follows the
    // URL when the browse page changes department.
    const urlCategory = searchParams.get("category") || "";
    const [department, setDepartment] = useState<string>(urlCategory);
    const [lastUrlCategory, setLastUrlCategory] = useState<string>(urlCategory);

    if (urlCategory !== lastUrlCategory) {
        setLastUrlCategory(urlCategory);
        setDepartment(urlCategory);
    }

    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const selected = departments.find((d: any) => d.slug === department || d.id === department);
    const departmentSlug = selected?.slug || "";
    const trimmed = query.trim();

    // Debounced so typing is not one request per keystroke.
    useEffect(() => {
        if (trimmed.length < 2) return;

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const params = new URLSearchParams({ q: trimmed });
                if (departmentSlug) params.set("category", departmentSlug);

                const res = await fetch(`/api/search/suggestions?${params.toString()}`, { signal: controller.signal });
                const data = await res.json();
                setSuggestions(data.suggestions || []);
            } catch {
                // aborted or offline: keep the previous list
            }
        }, 200);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [trimmed, departmentSlug]);

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
        };

        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    const search = (value: string, scope: string = departmentSlug) => {
        setOpen(false);
        setHighlighted(-1);
        inputRef.current?.blur();
        onNavigate?.();

        // On /browse the filters already applied survive a new search.
        const params = pathname === "/browse" ? new URLSearchParams(searchParams.toString()) : new URLSearchParams();

        if (value.trim()) params.set("search", value.trim());
        else params.delete("search");

        if (scope) params.set("category", scope);
        else params.delete("category");

        params.delete("page");
        params.delete("sub");

        if (params.size || pathname === "/browse") {
            router.push(`/browse?${params.toString()}`);
        }
    };

    const openProduct = (slug: string) => {
        setOpen(false);
        onNavigate?.();
        router.push(`/product/${slug}`);
    };

    // One flat list for keyboard navigation: "search for …", the products, then
    // (when scoped) the way out of the department.
    const visible = trimmed.length < 2 ? [] : suggestions;
    const rows: any[] =
        trimmed.length < 2
            ? []
            : [
                  { type: "search", scope: departmentSlug },
                  ...visible.map((suggestion: any) => ({ type: "product", suggestion })),
                  ...(departmentSlug ? [{ type: "search", scope: "" }] : []),
              ];

    const activate = (row: any) => (row.type === "product" ? openProduct(row.suggestion.slug) : search(query, row.scope));

    const keyHandler = (e: any) => {
        if (!rows.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setHighlighted((index) => (index + 1) % rows.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlighted((index) => (index <= 0 ? rows.length - 1 : index - 1));
        } else if (e.key === "Enter" && open && highlighted >= 0) {
            e.preventDefault();
            activate(rows[highlighted]);
        } else if (e.key === "Escape") {
            setOpen(false);
            setHighlighted(-1);
        }
    };

    const showList = open && rows.length > 0;

    return (
        <div ref={containerRef} className="relative w-full">
            <form
                role="search"
                onSubmit={(e) => {
                    e.preventDefault();
                    search(query);
                }}
                className="flex items-center h-11 w-full rounded-card bg-surface text-fg focus-within:ring-2 focus-within:ring-accent"
            >
                {/* A native select sits invisibly over the pill, so the control is
                    keyboard- and screen-reader-friendly and sizes to its label. */}
                <div
                    className={cn(
                        "relative ml-1.5 flex h-8 max-w-40 shrink-0 items-center gap-1 rounded-control px-2.5 text-sm transition-colors",
                        selected ? "bg-accent-soft text-accent-ink font-medium" : "bg-surface-muted text-fg-muted hover:text-fg"
                    )}
                >
                    <span className="truncate" aria-hidden="true">
                        {selected?.name || "All"}
                    </span>
                    <ChevronDownIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <label htmlFor={`${uid}-department`} className="sr-only">
                        Search in department
                    </label>
                    <select
                        id={`${uid}-department`}
                        value={departmentSlug}
                        onChange={(e) => {
                            setDepartment(e.target.value);
                            inputRef.current?.focus();
                        }}
                        className="absolute inset-0 w-full cursor-pointer opacity-0"
                    >
                        <option value="">All departments</option>
                        {departments.map((d: any) => (
                            <option key={d.slug} value={d.slug}>
                                {d.name}
                            </option>
                        ))}
                    </select>
                </div>

                <label htmlFor={`${uid}-input`} className="sr-only">
                    Search Markaz
                </label>
                <input
                    ref={inputRef}
                    id={`${uid}-input`}
                    type="search"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                        setHighlighted(-1);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={keyHandler}
                    placeholder={selected ? `Search ${selected.name}` : "Search Markaz"}
                    autoComplete="off"
                    enterKeyHint="search"
                    role="combobox"
                    aria-expanded={showList}
                    aria-controls={`${uid}-list`}
                    aria-autocomplete="list"
                    aria-activedescendant={showList && highlighted >= 0 ? `${uid}-row-${highlighted}` : undefined}
                    className="h-full min-w-0 flex-1 bg-transparent px-3 text-base outline-none placeholder:text-fg-subtle [&::-webkit-search-cancel-button]:hidden"
                />

                <button
                    type="submit"
                    aria-label="Search"
                    className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-accent text-fg hover:bg-accent-strong cursor-pointer"
                >
                    <MagnifyingGlassIcon className="h-5 w-5 stroke-2" />
                </button>
            </form>

            {showList && (
                <ul
                    id={`${uid}-list`}
                    role="listbox"
                    aria-label="Suggestions"
                    className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-[70vh] overflow-y-auto rounded-card border border-line bg-surface py-1.5 text-fg shadow-pop"
                >
                    {rows.map((row: any, i: number) => (
                        <li
                            key={row.type === "product" ? row.suggestion.slug : `search-${row.scope}`}
                            id={`${uid}-row-${i}`}
                            role="option"
                            aria-selected={i === highlighted}
                            onMouseEnter={() => setHighlighted(i)}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                activate(row);
                            }}
                            className={cn("flex cursor-pointer items-center gap-3 px-3 py-2 text-sm", i === highlighted && "bg-surface-muted")}
                        >
                            {row.type === "product" ? (
                                <>
                                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-control bg-surface-muted">
                                        {row.suggestion.image && (
                                            <Image src={row.suggestion.image} alt="" fill sizes="40px" className="object-contain" />
                                        )}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-fg-muted">
                                            <Highlight text={row.suggestion.name} query={trimmed} />
                                        </span>
                                        <span className="block truncate text-xs text-fg-subtle">{row.suggestion.department}</span>
                                    </span>
                                    <span className="shrink-0 text-sm font-medium tabular">{money(row.suggestion.price)}</span>
                                </>
                            ) : (
                                <>
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-accent-soft text-accent-ink">
                                        <MagnifyingGlassIcon className="h-5 w-5" />
                                    </span>
                                    <span className="min-w-0 flex-1 truncate">
                                        Search for <span className="font-semibold">&ldquo;{trimmed}&rdquo;</span>
                                        {row.scope ? (
                                            <span className="text-fg-muted"> in {selected?.name}</span>
                                        ) : departmentSlug ? (
                                            <span className="text-fg-muted"> in all departments</span>
                                        ) : null}
                                    </span>
                                    <ArrowUpRightIcon className="h-4 w-4 shrink-0 text-fg-subtle" />
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Search;
