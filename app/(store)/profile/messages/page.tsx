import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import ProfileShell from "@/components/profile/ProfileShell";
import MessagesClient from "@/components/profile/MessagesClient";
import { buildMessages } from "@/lib/messages";

export const metadata = {
    title: "Your Messages",
};

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/messages");
    }

    await connectDb();

    const user: any = await User.findById(session.user.id).select("name email createdAt").lean();
    const orders: any[] = await Order.find({ user: session.user.id })
        .select("products total status isPaid paidAt deliveredAt shippingAddress createdAt updatedAt")
        .sort({ createdAt: -1 })
        .lean();

    const messages = buildMessages(user, JSON.parse(JSON.stringify(orders)));

    return (
        <ProfileShell title="Your Messages">
            <MessagesClient messages={JSON.parse(JSON.stringify(messages))} />
        </ProfileShell>
    );
};

export default Page;
