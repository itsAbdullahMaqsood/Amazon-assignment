import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import { buildMessages } from "@/lib/messages";
import { PageHeader } from "@/components/ui/Layout";
import MessagesView from "@/components/account/MessagesView";

export const metadata = { title: "Your messages" };

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/messages");
    }

    await connectDb();

    const [user, orders]: any[] = await Promise.all([
        User.findById(session.user.id).select("name createdAt messagesReadAt").lean(),
        Order.find({ user: session.user.id })
            .select("products total status isPaid paymentMethod paidAt deliveredAt shippingAddress returnRequests createdAt")
            .sort({ createdAt: -1 })
            .lean(),
    ]);

    const messages = buildMessages(user, JSON.parse(JSON.stringify(orders)));

    return (
        <>
            <PageHeader
                title="Your messages"
                description="Every notice Markaz has about your orders, newest first. Each one is built from something the order records, so nothing here is a message that was never sent."
            />
            <MessagesView
                messages={JSON.parse(JSON.stringify(messages))}
                readAt={user?.messagesReadAt ? new Date(user.messagesReadAt).toISOString() : null}
            />
        </>
    );
};

export default Page;
