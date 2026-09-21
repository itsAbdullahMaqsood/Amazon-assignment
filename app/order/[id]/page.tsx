import { cache } from "react";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import Header from "@/components/Header/Header";
import MenuSideBar from "@/components/Header/MenuSidebar";
import OrderClient from "@/components/order/OrderClient";

// Cached so generateMetadata and the page share one query; resolving it in
// generateMetadata means a miss returns a real 404 status instead of a streamed 200.
const getOrder = cache(async (id: string, userId: string, role: string) => {
    await connectDb();

    let order: any = null;

    try {
        order = await Order.findById(id)
            .populate({ path: "user", model: User })
            .populate({ path: "products.product", model: Product, select: "slug" })
            .lean();
    } catch {
        return null;
    }

    if (!order) {
        return null;
    }

    // An order id is not a capability: only the owner or an admin may read it.
    const isOwner = String(order.user?._id) === String(userId);

    if (!isOwner && role !== "admin") {
        return null;
    }

    return JSON.parse(JSON.stringify(order));
});

export const generateMetadata = async ({ params }: any) => {
    const { id } = await params;
    const session = await auth();

    if (!session) {
        return { title: "Order" };
    }

    const order = await getOrder(id, session.user.id, session.user.role);

    if (!order) {
        notFound();
    }

    return { title: `Order ${id}` };
};

const Page = async ({ params }: any) => {
    const { id } = await params;
    const session = await auth();

    if (!session) {
        redirect(`/auth/signin?callbackUrl=/order/${id}`);
    }

    const order = await getOrder(id, session.user.id, session.user.role);

    if (!order) {
        notFound();
    }

    return (
        <>
            <Header title="Full Amazon Clone React" />

            <main className="max-w-screen-2xl mx-auto bg-gray-100 grid grid-cols-1 md:grid-cols-3 px-2 md:px-10 pt-5 pb-8 gap-4 md:gap-8">
                <OrderClient order={order} />
            </main>

            <MenuSideBar />
        </>
    );
};

export default Page;
