import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import { membershipState } from "@/lib/membership";
import { getAutoReorder } from "@/lib/autoReorderQueries";
import { getBuyAgain } from "@/lib/buyAgain";
import { PageHeader, SectionHeader } from "@/components/ui/Layout";
import MembershipPanel from "@/components/plus/MembershipPanel";
import AutoReorder from "@/components/plus/AutoReorder";

export const metadata = { title: "Membership" };

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/memberships");
    }

    await connectDb();

    const [user, schedules, bought]: any[] = await Promise.all([
        User.findById(session.user.id).select("membership").lean(),
        getAutoReorder(session.user.id),
        getBuyAgain(session.user.id, {}),
    ]);

    const membership = membershipState(user?.membership);
    const candidates = bought.groups.flatMap((group: any) => group.items);

    return (
        <>
            <PageHeader
                title="Membership"
                description="Markaz Plus, and the things you have asked Markaz to remind you about."
            />

            <MembershipPanel membership={JSON.parse(JSON.stringify(membership))} />

            <section className="mt-10">
                <SectionHeader
                    title="Auto-reorder"
                    description="A reminder when something you buy regularly is about due. Markaz never places the order itself."
                />
                <AutoReorder schedules={schedules} candidates={candidates} />
            </section>
        </>
    );
};

export default Page;
