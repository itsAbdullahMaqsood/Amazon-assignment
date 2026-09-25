import { redirect } from "next/navigation";

import { auth } from "@/auth";
import ProfileShell from "@/components/profile/ProfileShell";
import SecurityClient from "@/components/profile/SecurityClient";

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/security");
    }

    return (
        <ProfileShell title="Login & security">
            <SecurityClient />
        </ProfileShell>
    );
};

export default Page;
