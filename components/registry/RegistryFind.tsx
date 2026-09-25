"use client";

import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Layout";
import { Input } from "@/components/ui/Field";
import { listDate } from "@/lib/lists";

// Search is a plain form: the term lives in the URL, so a search can be shared
// and reloaded, and the server does the matching.
const RegistryFind = ({ term, results }: any) => (
    <>
        <form role="search" action="/registry" className="flex max-w-xl gap-2">
            <div className="relative flex-1">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-fg-subtle" />
                <Input
                    type="search"
                    name="name"
                    defaultValue={term}
                    aria-label="Search by name"
                    placeholder="A name, or the name of the list"
                    className="pl-10"
                />
            </div>
            <Button type="submit">Search</Button>
        </form>

        {term && (
            <div className="mt-8">
                <p className="text-sm text-fg-muted">
                    {results.length} public list{results.length === 1 ? "" : "s"} matching “{term}”
                </p>

                {results.length === 0 ? (
                    <EmptyState
                        className="mt-4"
                        icon={MagnifyingGlassIcon}
                        title="Nothing public matched"
                        description="Only lists their owner made public can be found by name. If you were sent a link, open that instead — a shared list works by link alone."
                    />
                ) : (
                    <ul className="mt-4 divide-y divide-line border-y border-line">
                        {results.map((result: any) => (
                            <li key={result._id}>
                                <Link href={`/registry/${result._id}`} className="flex items-center justify-between gap-4 py-4">
                                    <span className="min-w-0">
                                        <span className="block font-medium text-fg">{result.name}</span>
                                        <span className="block text-sm text-fg-muted">
                                            {result.owner} · {result.count} item{result.count === 1 ? "" : "s"}
                                            {result.bought > 0 && <> · {result.bought} bought</>}
                                            {result.createdAt && <> · made {listDate(result.createdAt)}</>}
                                        </span>
                                    </span>
                                    <Badge tone="accent">Public</Badge>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        )}
    </>
);

export default RegistryFind;
