import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import ProfileShell from "@/components/profile/ProfileShell";
import MembershipsClient from "@/components/memberships/MembershipsClient";

export const metadata = {
    title: "Memberships & Subscriptions",
};

// Subscribe & Save only offers what the shopper has actually bought, so the
// candidates are folded out of their order history, newest order first.
const recurringItems = (orders: any[]) => {
    const seen = new Map<string, any>();

    orders.forEach((order: any) => {
        const orderedOn = new Date(order.createdAt).toISOString().slice(0, 10);

        (order.products || []).forEach((line: any) => {
            const id = String(line.product?._id || line.product || line.name);
            const entry = seen.get(id) || {
                id,
                name: line.name,
                image: line.image || line.color?.image || "",
                slug: line.product?.slug || "",
                price: line.price,
                timesOrdered: 0,
                lastOrderedAt: orderedOn,
            };

            entry.timesOrdered += 1;
            seen.set(id, entry);
        });
    });

    return Array.from(seen.values()).slice(0, 8);
};

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/memberships");
    }

    await connectDb();

    const mine: any = { user: session.user.id };

    const orders = await Order.find(mine)
        .populate({ path: "products.product", model: Product, select: "slug" })
        .sort({ createdAt: -1 })
        .lean();

    const items = recurringItems(orders as any[]);

    return (
        <ProfileShell title="Memberships & Subscriptions">
            <MembershipsClient items={JSON.parse(JSON.stringify(items))} />
        </ProfileShell>
    );
};

export default Page;
