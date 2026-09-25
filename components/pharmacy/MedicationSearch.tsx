"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// Searches the openFDA-seeded catalog; the results page does the query.
const MedicationSearch = ({ defaultValue = "" }: any) => {
    const router = useRouter();
    const [query, setQuery] = useState<string>(defaultValue);

    const submitHandler = (e: any) => {
        e.preventDefault();

        if (query.trim().length > 1) {
            router.push(`/pharmacy/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <form onSubmit={submitHandler} role="search" className="flex max-w-3xl mx-auto w-full">
            <label htmlFor="medication-search" className="sr-only">
                Type your medication name
            </label>

            <div className="relative flex-1">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                    id="medication-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type your medication name"
                    className="w-full bg-white rounded-l-md py-4 pl-12 pr-4 outline-none border border-slate-200"
                />
            </div>

            <button
                type="submit"
                className="bg-success hover:bg-success text-white px-8 rounded-r-md font-semibold cursor-pointer"
            >
                Search
            </button>
        </form>
    );
};

export default MedicationSearch;
