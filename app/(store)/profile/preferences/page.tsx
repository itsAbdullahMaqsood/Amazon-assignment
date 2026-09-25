import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import { PREFERENCE_COOKIE, decodePreferences, defaultPreferences } from "@/lib/preferences";
import { PageHeader } from "@/components/ui/Layout";
import PreferencesView from "@/components/account/PreferencesView";

export const metadata = { title: "Shopping preferences" };

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/preferences");
    }

    await connectDb();

    const [user, jar]: any[] = await Promise.all([
        User.findById(session.user.id).select("preferences").lean(),
        cookies(),
    ]);

    // The account is the record; the cookie is a mirror for the first paint, and
    // it wins only when the account has never saved anything.
    const preferences = user?.preferences
        ? { ...defaultPreferences, ...JSON.parse(JSON.stringify(user.preferences)) }
        : decodePreferences(jar.get(PREFERENCE_COOKIE)?.value);

    return (
        <>
            <PageHeader
                title="Shopping preferences"
                description="Three settings, and each one changes something you can see."
            />

            <PreferencesView preferences={preferences} signedIn />

            <section className="mt-10 max-w-prose">
                <h2 className="font-display text-lg font-semibold text-fg">What isn&apos;t here</h2>
                <ul className="mt-2 space-y-2 text-sm text-fg-muted">
                    <li>
                        <span className="font-medium text-fg">Language and currency.</span> Markaz is written in
                        English and prices in US dollars. A picker that changed neither would only be furniture.
                    </li>
                    <li>
                        <span className="font-medium text-fg">Marketing email and texts.</span> Markaz emails you
                        about things you did — an order, a password reset, a confirmation link — and nothing else, so
                        there is nothing to opt out of.
                    </li>
                    <li>
                        <span className="font-medium text-fg">Advertising preferences.</span> There are no adverts in
                        this store. Nothing is sponsored, nothing is paid for placement, and no advertising partner
                        gets anything about you.
                    </li>
                </ul>
                <p className="mt-4 text-sm text-fg-muted">
                    What Markaz holds about you, and how to take it away, is under{" "}
                    <Link href="/profile/data" className="text-link">
                        privacy &amp; data
                    </Link>
                    .
                </p>
            </section>
        </>
    );
};

export default Page;
