"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Every filter lives in the query string, so a filtered page can be shared,
// bookmarked and reloaded. Multi-value params are underscore joined
// (?brand=Apple_Samsung). Any change other than the page number goes back to
// page 1.
const useBrowseQuery = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [pending, startTransition] = useTransition();

    const get = (name: string) => searchParams.get(name) || "";
    const getList = (name: string) => get(name).split("_").filter(Boolean);

    const set = (partial: Record<string, any>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(partial).forEach(([key, value]) => {
            if (value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length)) {
                params.delete(key);
            } else {
                params.set(key, Array.isArray(value) ? value.join("_") : String(value));
            }
        });

        if (!("page" in partial)) {
            params.delete("page");
        }

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`, { scroll: "page" in partial });
        });
    };

    const toggle = (name: string, value: string) => {
        const current = getList(name);
        set({ [name]: current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value] });
    };

    // `current` and `filter` are the names older screens (deals, keep shopping) use.
    const current = Object.fromEntries(searchParams.entries());

    return { get, getList, set, toggle, pending, searchParams, current, filter: set };
};

export default useBrowseQuery;
