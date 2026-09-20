"use client";

import { useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Every filter lives in the query string. Multi-value params are underscore
// joined, e.g. ?size=S_M_L&color=%23000000_%232980b9.
export const useBrowseQuery = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const debounceRef = useRef<any>(null);

    const current = Object.fromEntries(searchParams.entries());

    const filter = (partial: any) => {
        const next: any = { ...current, ...partial };

        // Changing any filter puts the user back on the first page.
        if (!("page" in partial)) {
            delete next.page;
        }

        const params = new URLSearchParams();

        Object.entries(next).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                params.set(key, String(value));
            }
        });

        router.push(`${pathname}?${params.toString()}`);
    };

    const filterDebounced = (partial: any, delay = 500) => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => filter(partial), delay);
    };

    // Toggles one entry inside an underscore-joined param, leaving no stray
    // underscores behind whether the entry is first, middle or last.
    const replaceQuery = (queryName: string, value: string) => {
        const existing = current[queryName] || "";
        const parts = existing ? existing.split("_") : [];
        const active = parts.includes(value);

        let result: any;

        if (!existing) {
            result = value;
        } else if (existing === value) {
            result = "";
        } else if (active) {
            result = parts.filter((part) => part !== value).join("_");
        } else {
            result = `${existing}_${value}`;
        }

        return { active, result };
    };

    return { router, pathname, searchParams, current, filter, filterDebounced, replaceQuery };
};

export default useBrowseQuery;
