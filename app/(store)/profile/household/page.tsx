import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import { isMember } from "@/lib/membership";
import { PageHeader } from "@/components/ui/Layout";
import HouseholdView from "@/components/account/HouseholdView";

export const metadata = { title: "Household" };

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/household");
    }

    await connectDb();

    const user: any = await User.findById(session.user.id).select("household membership").lean();

    const household = {
        members: (user?.household?.members || []).map((member: any) => ({
            _id: String(member._id),
            name: member.name,
            email: member.email,
            addedAt: member.addedAt,
        })),
        sharing: { delivery: user?.household?.sharing?.delivery !== false },
    };

    return (
        <>
            <PageHeader
                title="Household"
                description="The people your Markaz Plus delivery covers."
            />
            <HouseholdView household={JSON.parse(JSON.stringify(household))} member={isMember(user?.membership)} />
        </>
    );
};

export default Page;
