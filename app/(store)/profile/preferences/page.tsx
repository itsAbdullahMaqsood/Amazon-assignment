import { redirect } from "next/navigation";

import { auth } from "@/auth";
import ProfileShell from "@/components/profile/ProfileShell";
import PreferencesClient from "@/components/profile/PreferencesClient";

export const metadata = {
    title: "Your Shopping preferences",
};

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/preferences");
    }

    return (
        <ProfileShell title="Your Shopping preferences">
            <p className="text-slate-600 -mt-3 mb-6 max-w-3xl">
                These settings are stored in this browser and applied the next time a page asks for
                them. Removing your browsing history changes your account, not just this browser.
            </p>

            <PreferencesClient />
        </ProfileShell>
    );
};

export default Page;
