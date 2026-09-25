import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

import connectDb from "@/lib/db";
import User from "@/models/User";
import RegistryNav from "@/components/registry/RegistryNav";
import RegistrySearch from "@/components/registry/RegistrySearch";
import RegistryResults from "@/components/registry/RegistryResults";
import { CreateStrip } from "@/components/registry/sections";
import { searchPattern, toRegistryResult } from "@/lib/registry";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Find a List or Registry",
};

const MAX_RESULTS = 40;

// Only a list its owner marked public is searchable: shared lists are reachable
// by their link and private ones are not reachable at all.
const search = async (term: string) => {
    if (!term) {
        return [];
    }

    const pattern = searchPattern(term);

    const users = await User.find({
        "lists.privacy": "public",
        $or: [{ name: pattern }, { "lists.name": pattern }],
    })
        .select("name lists")
        .limit(MAX_RESULTS)
        .lean();

    return users
        .flatMap((user: any) =>
            (user.lists || [])
                .filter(
                    (list: any) =>
                        list.privacy === "public" &&
                        (pattern.test(list.name || "") || pattern.test(user.name || ""))
                )
                .map((list: any) => toRegistryResult(user, list))
        )
        .slice(0, MAX_RESULTS);
};

const Page = async ({ searchParams }: any) => {
    const query = (await searchParams) || {};
    const term = String(query.name || "").trim();

    await connectDb();

    const results = await search(term);

    return (
        <>

            <main className="bg-surface-muted min-h-[60vh]">
                <div className="bg-white">
                    <RegistryNav active="Find a registry or gift list" />
                </div>

                <div className="max-w-[1000px] mx-auto px-4 py-8">
                    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-slate-600">
                        <Link href="/registry" className="hover:underline">
                            Registry &amp; Gifting
                        </Link>
                        <ChevronRightIcon className="h-3 mx-1" />
                        <span>Find a List or Registry</span>
                    </nav>

                    <h1 className="text-3xl font-bold mt-2">Find a List or Registry</h1>
                    <p className="mt-2 text-[15px]">
                        Search by the name of the person who created the list, or by the name of the
                        list itself.
                    </p>

                    <div className="mt-5 bg-white border border-slate-300 rounded-lg p-5">
                        <RegistrySearch defaultValue={term} buttonLabel="Search" />
                    </div>

                    {term && (
                        <p className="mt-6 text-sm text-slate-700">
                            {results.length} {results.length === 1 ? "result" : "results"} for{" "}
                            <span className="font-semibold">&ldquo;{term}&rdquo;</span>
                        </p>
                    )}

                    <div className="mt-4">
                        <RegistryResults results={results} term={term} />
                    </div>
                </div>

                <div className="bg-white pt-10">
                    <CreateStrip />
                </div>
            </main>


        </>
    );
};

export default Page;
