import Link from "next/link";

import ProfileShell from "@/components/profile/ProfileShell";

// Any /profile/* path without its own page lands here rather than 404ing.
const Page = async ({ params }: any) => {
    const { section } = await params;
    const title = (section || []).join(" / ");

    return (
        <ProfileShell title={title || "Your Account"}>
            <div className="bg-white border border-slate-300 rounded-lg p-8">
                <p className="font-semibold">This section isn&apos;t available in this build yet.</p>
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
