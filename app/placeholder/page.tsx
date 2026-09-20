import Link from "next/link";

import ProfileShell from "@/components/profile/ProfileShell";

// One shared destination for every account link that has no page in this build,
// so nothing in the flyout or the grid is a dead anchor.
const Page = async ({ searchParams }: any) => {
    const query = await searchParams;
    const title = query?.title || "Coming soon";

    return (
        <ProfileShell title={title}>
            <div className="bg-white border border-slate-300 rounded-lg p-8">
                <p className="font-semibold">This section isn&apos;t available in this build yet.</p>
                <p className="text-sm text-slate-600 mt-2">
                    {title} is part of Amazon&apos;s account area that this clone does not implement.
                </p>
                <Link
                    href="/profile"
                    className="inline-block mt-5 px-6 py-2 rounded-full bg-linear-to-r from-amazon-orange to-yellow-300 text-amazon-blue_dark"
                >
                    Back to Your Account
                </Link>
            </div>
        </ProfileShell>
    );
};

export default Page;
