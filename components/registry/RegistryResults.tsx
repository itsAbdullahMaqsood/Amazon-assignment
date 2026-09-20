import Link from "next/link";

import { registryDate } from "@/lib/registry";
import RegistryArt from "./art";

// A row per public list: whose it is, what it is for, and how much is on it.
const RegistryResults = ({ results, term }: any) => {
    if (!results.length) {
        return (
            <div className="border border-slate-300 rounded-lg p-8 bg-white">
                <p className="font-semibold">
                    {term
                        ? `No public lists or registries match "${term}".`
                        : "Enter a name to search for a list or registry."}
                </p>
                <p className="text-sm text-slate-600 mt-2">
                    Only lists their owner set to public can be searched for. A shared list is
                    reachable by its link, and a private one only by its owner.
                </p>

                <Link href="/registry" className="inline-block mt-5 text-[#007185] hover:underline">
                    Back to registry &amp; gifting
                </Link>
            </div>
        );
    }

    return (
        <ul className="space-y-4">
            {results.map((result: any) => (
                <li key={result._id}>
                    <Link
                        href={`/registry/${result._id}`}
                        className="flex items-center gap-5 bg-white border border-slate-300 rounded-lg p-4 hover:border-slate-400"
                    >
                        <RegistryArt art={result.occasion} className="h-20 w-20 shrink-0" />

                        <div className="flex-1">
                            <p className="text-lg font-semibold text-[#0F5FA6]">{result.name}</p>
                            <p className="text-sm text-slate-700">{result.owner}</p>
                            <p className="text-sm text-slate-600 mt-1">
                                {result.occasionLabel}
                                {result.createdAt && ` · Created ${registryDate(result.createdAt)}`}
                            </p>
                        </div>

                        <p className="text-sm text-slate-600 whitespace-nowrap">
                            {result.count} {result.count === 1 ? "item" : "items"}
                        </p>
                    </Link>
                </li>
            ))}
        </ul>
    );
};

export default RegistryResults;
