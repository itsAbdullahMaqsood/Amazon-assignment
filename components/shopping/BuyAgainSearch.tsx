"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { Input } from "@/components/ui/Field";
import useBrowseQuery from "@/components/browse/useBrowseQuery";

// Searches what you have bought, not the catalogue: the query goes in the URL
// and the server filters the list it already built.
const BuyAgainSearch = ({ search }: any) => {
    const { set } = useBrowseQuery();

    return (
        <form
            role="search"
            onSubmit={(event: any) => {
                event.preventDefault();
                set({ search: event.currentTarget.elements.search.value.trim() });
            }}
            className="relative max-w-sm"
        >
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-fg-subtle" />
            <Input
                type="search"
                name="search"
                defaultValue={search}
                aria-label="Search what you've bought"
                placeholder="Search your purchases"
                className="pl-10"
            />
        </form>
    );
};

export default BuyAgainSearch;
