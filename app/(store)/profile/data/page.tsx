import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import ProfileShell from "@/components/profile/ProfileShell";
import DataClient from "@/components/profile/DataClient";

export const metadata = {
    title: "Manage your data",
};

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/data");
    }

    return (
        <ProfileShell title="Manage your data">
            <p className="text-slate-600 -mt-3 mb-6 max-w-3xl">
                Download what this store holds about you, see what it keeps and why, or close the
                account for good. To stop new browsing history being recorded, change{" "}
                <Link href="/profile/preferences" className="text-accent-ink hover:underline">
                    your shopping preferences
                </Link>
                .
            </p>

            <DataClient email={session.user.email} />
        </ProfileShell>
    );
};

export default Page;
