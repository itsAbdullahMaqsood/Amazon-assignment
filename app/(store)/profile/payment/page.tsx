import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import ProfileShell from "@/components/profile/ProfileShell";
import PaymentClient from "@/components/profile/PaymentClient";

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/payment");
    }

    await connectDb();
    const user: any = await User.findById(session.user.id).select("defaultPaymentMethod").lean();

    return (
        <ProfileShell title="Your Payments">
            <PaymentClient defaultPaymentMethod={user?.defaultPaymentMethod || ""} />
        </ProfileShell>
    );
};

export default Page;
