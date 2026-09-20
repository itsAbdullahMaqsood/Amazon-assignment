"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// Searches the public lists other shoppers have created; /registry/find runs
// the query itself, so this only carries the term over.
const RegistrySearch = ({ defaultValue = "", buttonLabel = "Search" }: any) => {
    const router = useRouter();
    const [name, setName] = useState<string>(defaultValue);

    const submitHandler = (e: any) => {
        e.preventDefault();

        const term = name.trim();

        router.push(term ? `/registry/find?name=${encodeURIComponent(term)}` : "/registry/find");
    };

    return (
        <form onSubmit={submitHandler} role="search" className="flex w-full">
            <label htmlFor="registry-search" className="sr-only">
                Search by the name of the person or the list
            </label>

            <div className="relative flex-1">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                    id="registry-search"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Search by name of the person or the list"
                    className="w-full bg-white rounded-l-md py-3 pl-12 pr-4 border border-slate-300 outline-none focus:border-[#007185]"
                />
            </div>

            <button
                type="submit"
                className="bg-[#FFD814] hover:bg-[#F7CA00] text-black px-8 rounded-r-md font-medium cursor-pointer"
            >
                {buttonLabel}
            </button>
        </form>
    );
};

export default RegistrySearch;
