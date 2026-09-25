import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { getOrderDetail } from "@/lib/orderQueries";
import { orderNumber } from "@/lib/returns";
import OrderDetail from "@/components/orders/OrderDetail";

export const generateMetadata = async ({ params }: any) => {
    const { id } = await params;

    return { title: `Order #${orderNumber(id)}` };
};

const Page = async ({ params, searchParams }: any) => {
    const { id } = await params;
    const query = await searchParams;
    const session = await auth();

    if (!session) {
        redirect(`/auth/signin?callbackUrl=/order/${id}`);
    }

    const order = await getOrderDetail(id, session.user.id, session.user.role);

    if (!order) {
        notFound();
    }

    return <OrderDetail order={order} placed={query?.placed === "1"} />;
};

export default Page;
