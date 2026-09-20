import { useState } from "react";
import { useRouter } from "next/router";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const Search = ({ searchHandler }: any) => {
    const router = useRouter();
    const [query, setQuery] = useState<string>((router.query.search as string) || "");

    const submitHandler = (e: any) => {
        e.preventDefault();

        if (query.trim().length > 1) {
            if (router.pathname !== "/browse") {
                router.push(`/browse?search=${query}`);
            } else if (searchHandler) {
                searchHandler(query);
            }
        } else if (router.pathname === "/browse" && searchHandler) {
            searchHandler("");
        }
    };

    return (
        <form
            onSubmit={submitHandler}
            className="flex items-center grow bg-amazon-orange rounded-md overflow-hidden"
        >
            <select className="hidden md:inline h-11 w-16 bg-gray-200 text-xs text-gray-600 border-r border-gray-300 outline-none cursor-pointer px-2">
                <option value="All">All</option>
                <option value="Computers">Computers</option>
                <option value="Arts & Crafts">Arts &amp; Crafts</option>
                <option value="Baby">Baby</option>
                <option value="Book">Book</option>
            </select>

            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Amazon"
                className="h-11 grow shrink w-full px-3 outline-none text-black"
            />

            <button type="submit" className="px-2">
                <MagnifyingGlassIcon className="h-8 w-8 text-amazon-blue_dark" />
            </button>
        </form>
    );
};

export default Search;
