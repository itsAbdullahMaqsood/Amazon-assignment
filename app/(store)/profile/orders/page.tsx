import Link from "next/link";
import { redirect } from "next/navigation";
import { ArchiveBoxIcon } from "@heroicons/react/24/outline";

import { auth } from "@/auth";
import { getOrders } from "@/lib/orderQueries";
import { rangeLabel } from "@/lib/orders";
import Button from "@/components/ui/Button";
import { EmptyState, PageHeader } from "@/components/ui/Layout";
import OrderCard from "@/components/orders/OrderCard";
import OrdersNav from "@/components/orders/OrdersNav";
import OrdersToolbar from "@/components/orders/OrdersToolbar";

export const metadata = { title: "Your orders" };

const Page = async ({ searchParams }: any) => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/orders");
    }

    const query = (await searchParams) || {};
    const tab = String(query.tab || "");
    const time = String(query.time || "");
    const search = String(query.search || "").trim();
    const { orders, tabs, returnsCount } = await getOrders(session.user.id, { tab, time, search });

    // Search and time carry across the tabs.
    const carried = new URLSearchParams({ ...(time && { time }), ...(search && { search }) }).toString();
    const filtered = Boolean(time || search);

    return (
        <>
            <PageHeader title="Your orders" />

            <OrdersNav tabs={tabs} active={tab} returnsCount={returnsCount} params={carried} />

            <div className="mt-5">
                <OrdersToolbar tab={tab} time={time} search={search} />
                {filtered && (
                    <p className="mt-3 text-sm text-fg-muted">
                        {orders.length} order{orders.length === 1 ? "" : "s"}
                        {search && <> matching “{search}”</>}
                        {time && <> placed in {rangeLabel(time)}</>} ·{" "}
                        <Link href={`/profile/orders${tab ? `?tab=${tab}` : ""}`} className="text-link">
                            Clear
                        </Link>
                    </p>
                )}
            </div>

            <div className="mt-6 space-y-4">
                {orders.length ? (
                    orders.map((order: any) => <OrderCard key={order._id} order={order} />)
                ) : (
                    <EmptyState
                        icon={ArchiveBoxIcon}
                        title={filtered ? "No orders match" : tab ? "Nothing here yet" : "No orders yet"}
                        description={
                            filtered
                                ? "Try another word or a longer time range."
                                : tab
                                  ? "Orders move into this tab as their status changes."
                                  : "When you place an order it shows up here, with its status and everything you can do with it."
                        }
                        action={!filtered && !tab ? <Button href="/browse">Start shopping</Button> : undefined}
                    />
                )}
            </div>
        </>
    );
};

export default Page;
