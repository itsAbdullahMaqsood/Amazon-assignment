"use client";

import { useState } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { Input } from "@/components/ui/Field";

// Matches are derived during render from the topic list the server handed down.
// There is no help-article index to query: eight topics is a list you read, not
// a corpus you search, and the box narrows it as you type.
const HelpSearch = ({ topics }: any) => {
    const [query, setQuery] = useState("");

    const needle = query.trim().toLowerCase();
    const matches = needle
        ? topics.filter((topic: any) => `${topic.title} ${topic.blurb} ${topic.intro}`.toLowerCase().includes(needle))
        : [];

    return (
        <div className="max-w-xl">
            <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-fg-subtle" />
                <Input
                    type="search"
                    value={query}
                    onChange={(event: any) => setQuery(event.target.value)}
                    aria-label="Search help"
                    placeholder="What do you need help with?"
                    className="pl-10"
                />
            </div>

            {needle && (
                <div aria-live="polite" className="mt-3">
                    {matches.length === 0 ? (
                        <p className="text-sm text-fg-muted">
                            Nothing in the help pages mentions “{query.trim()}”. Ask Shabana, or open the order you
                            have a question about.
                        </p>
                    ) : (
                        <ul className="divide-y divide-line rounded-card border border-line bg-surface">
                            {matches.map((topic: any) => (
                                <li key={topic.slug}>
                                    <Link href={`/customer-service/${topic.slug}`} className="block px-4 py-3 hover:bg-surface-muted">
                                        <span className="block text-sm font-medium text-fg">{topic.title}</span>
                                        <span className="block text-sm text-fg-muted">{topic.blurb}</span>
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
