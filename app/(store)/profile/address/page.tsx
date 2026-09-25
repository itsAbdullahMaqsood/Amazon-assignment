import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import ProfileShell from "@/components/profile/ProfileShell";
import AddressClient from "@/components/profile/AddressClient";

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/address");
    }

    await connectDb();
    const user: any = await User.findById(session.user.id).lean();

    return (
        <ProfileShell title="Your Addresses">
            <AddressClient user={JSON.parse(JSON.stringify(user))} />
        </ProfileShell>
    );
};

export default Page;
