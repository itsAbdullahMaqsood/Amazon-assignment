import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import { PageHeader } from "@/components/ui/Layout";
import AddressBook from "@/components/account/AddressBook";

export const metadata = { title: "Your addresses" };

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/address");
    }

    await connectDb();

    const user: any = await User.findById(session.user.id).select("address").lean();

    return (
        <>
            <PageHeader
                title="Your addresses"
                description="Checkout uses the one marked for it. Adding an address here saves a step later."
            />
            <AddressBook addresses={JSON.parse(JSON.stringify(user?.address || []))} />
        </>
    );
};

export default Page;
