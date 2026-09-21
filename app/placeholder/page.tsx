import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import ProfileShell from "@/components/profile/ProfileShell";
import { suggestionsFor } from "@/components/profile/accountLinks";

// One shared destination for every account link that has no page in this build.
// It names what is missing and points at the nearest screen that does exist,
// rather than leaving the customer at a dead end.
const Page = async ({ searchParams }: any) => {
    const query = await searchParams;
    const title = query?.title || "Coming soon";
    const suggestions = suggestionsFor(title);

    return (
        <ProfileShell title={title}>
            <div className="bg-white border border-slate-300 rounded-lg p-8">
                <p className="font-semibold">This section isn&apos;t available in this build yet.</p>
                <p className="text-sm text-slate-600 mt-2">
                    {title} is part of Amazon&apos;s account area that this clone does not
                    implement. Everything below is built and working.
                </p>

                <ul className="mt-6 space-y-2">
                    {suggestions.map((suggestion: any) => (
                        <li key={suggestion.href}>
                            <Link
                                href={suggestion.href}
                                className="inline-flex items-center gap-2 text-[#0F5FA6] hover:text-[#C7511F] hover:underline"
                            >
                                {suggestion.label}
                                <ArrowRightIcon className="h-4" />
                            </Link>
                        </li>
                    ))}
                </ul>

                <Link
                    href="/profile"
                    className="inline-block mt-6 px-6 py-2 rounded-full bg-linear-to-r from-amazon-orange to-yellow-300 text-amazon-blue_dark"
                >
                    Back to Your Account
                </Link>
            </div>
        </ProfileShell>
    );
};

export default Page;
