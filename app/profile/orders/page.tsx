import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { escapeRegex } from "@/utils/regex";
import ProfileShell from "@/components/profile/ProfileShell";
import OrdersList from "@/components/profile/OrdersList";

const Page = async ({ searchParams }: any) => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/orders");
    }

    const query = await searchParams;
    const filter = query?.filter || "";
    const search = query?.search || "";

    const clause: any = { user: session.user.id };

    if (filter === "paid") {
        clause.isPaid = true;
    } else if (filter === "unpaid") {
        clause.isPaid = false;
    } else if (filter) {
        clause.status = filter;
    }

    if (search) {
        clause["products.name"] = { $regex: escapeRegex(search), $options: "i" };
    }

    await connectDb();

    const orders = await Order.find(clause)
        .populate({ path: "products.product", model: Product, select: "slug" })
        .sort({ createdAt: -1 })
        .lean();

    return (
        <ProfileShell title="Your Orders">
            <OrdersList orders={JSON.parse(JSON.stringify(orders))} active={filter} search={search} />
        </ProfileShell>
    );
};

export default Page;
