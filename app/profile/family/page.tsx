import { redirect } from "next/navigation";

import { auth } from "@/auth";
import ProfileShell from "@/components/profile/ProfileShell";
import HouseholdClient from "@/components/profile/HouseholdClient";

export const metadata = { title: "Amazon Household" };

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/family");
    }

    return (
        <ProfileShell title="Amazon Household">
            <HouseholdClient owner={{ name: session.user.name, email: session.user.email }} />
        </ProfileShell>
    );
};

export default Page;
