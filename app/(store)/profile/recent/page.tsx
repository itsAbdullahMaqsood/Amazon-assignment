import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getViewed } from "@/lib/buyAgain";
import { HISTORY_COOKIE } from "@/lib/preferences";
import { PageHeader } from "@/components/ui/Layout";
import ViewedView from "@/components/shopping/ViewedView";

export const metadata = { title: "Browsing history" };

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/recent");
    }

    const [items, jar] = await Promise.all([getViewed(session.user.id), cookies()]);
    const historyOff = jar.get(HISTORY_COOKIE)?.value === "0";

    return (
        <>
            <PageHeader
                title="Browsing history"
                description={
                    <>
                        The products you opened, newest first, priced as they are today. Recording can be switched
                        off in{" "}
                        <Link href="/profile/preferences" className="text-link">
                            shopping preferences
                        </Link>
                        .
                    </>
                }
            />
            <ViewedView items={items} historyOff={historyOff} />
        </>
    );
};

export default Page;
