import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getOrders, getReturns } from "@/lib/orderQueries";
import { Breadcrumbs, Container, PageHeader } from "@/components/ui/Layout";
import OrdersNav from "@/components/orders/OrdersNav";
import ReturnsView from "@/components/returns/ReturnsView";

export const dynamic = "force-dynamic";

export const metadata = { title: "Returns" };

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/returns");
    }

    const [{ tabs, returnsCount }, { requests, returnable }] = await Promise.all([
        getOrders(session.user.id, {}),
        getReturns(session.user.id),
    ]);

    return (
        <main>
            <Container className="max-w-5xl pb-10">
                <Breadcrumbs className="pt-6" items={[{ label: "Your account", href: "/profile" }, { label: "Returns" }]} />
                <PageHeader title="Your orders" className="pt-3 md:pt-4" />
                <OrdersNav tabs={tabs} active="returns" returnsCount={returnsCount} />
                <div className="mt-6">
                    <ReturnsView requests={requests} returnable={returnable} />
                </div>
            </Container>
        </main>
    );
};

export default Page;
