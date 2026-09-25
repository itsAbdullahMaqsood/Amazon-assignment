"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// Matches are derived during render from the topic list the server handed down,
// so there is no effect and no state beyond what the shopper typed.
const HelpSearch = ({ topics }: any) => {
    const router = useRouter();
    const [query, setQuery] = useState<string>("");

    const needle = query.trim().toLowerCase();
    const matches = needle
        ? topics.filter((topic: any) =>
              `${topic.title} ${topic.blurb} ${topic.intro}`.toLowerCase().includes(needle)
          )
        : [];

    const submitHandler = (e: any) => {
        e.preventDefault();

        if (matches.length > 0) {
            router.push(`/customer-service/${matches[0].slug}`);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <form onSubmit={submitHandler} className="flex">
                <label htmlFor="help-search" className="sr-only">
                    Search help
                </label>

                <input
                    id="help-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search our help library"
                    className="grow h-11 px-4 rounded-l-md text-black bg-white outline-none focus:ring-3 focus:ring-accent"
                />

                <button
                    type="submit"
                    aria-label="Search help"
                    className="button-orange h-11 w-12 rounded-l-none flex items-center justify-center cursor-pointer"
                >
                    <MagnifyingGlassIcon className="h-6 text-slate-900" />
                </button>
            </form>

            {needle && (
                <div className="bg-white text-black rounded-md mt-2 p-2 text-left shadow-lg">
                    {matches.length === 0 ? (
                        <p className="px-2 py-1 text-sm text-slate-600">
                            No help article matches &quot;{query.trim()}&quot;.
                        </p>
                    ) : (
                        <ul>
                            {matches.slice(0, 5).map((topic: any) => (
                                <li key={topic.slug}>
                                    <Link
                                        href={`/customer-service/${topic.slug}`}
                                        className="block px-2 py-1.5 rounded hover:bg-slate-100 text-sm"
                                    >
                                        <span className="font-semibold">{topic.title}</span>
                                        <span className="block text-xs text-slate-600">
                                            {topic.blurb}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default HelpSearch;
