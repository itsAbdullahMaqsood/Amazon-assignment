import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import ProfileShell from "@/components/profile/ProfileShell";
import ReturnsTabs from "@/components/returns/ReturnsTabs";
import ReturnableOrderCard from "@/components/returns/ReturnableOrderCard";
import ReturnRequestCard from "@/components/returns/ReturnRequestCard";
import {
    RETURN_WINDOW_DAYS,
    daysLeftToReturn,
    isReturnable,
    qtyReturnable,
    returnClockStart,
    returnStatuses,
} from "@/lib/returns";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Returns Center",
};

const emptyState = (heading: string, body: any) => (
    <div className="border border-slate-300 rounded-lg bg-white p-8 text-center mt-6">
        <p className="font-semibold">{heading}</p>
        <p className="text-sm text-slate-600 mt-1">{body}</p>
        <Link
            href="/profile/orders"
            className="inline-block mt-4 px-6 py-2 rounded-full bg-linear-to-r from-amazon-orange to-yellow-300 text-amazon-blue_dark"
        >
            Go to Your Orders
        </Link>
    </div>
);

const Page = async ({ searchParams }: any) => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/returns");
    }

    const query = await searchParams;
    const tab = query?.tab || "";

    await connectDb();

    const clause: any = { user: session.user.id };

    const orders: any = await Order.find(clause)
        .populate({ path: "products.product", model: Product, select: "slug" })
        .sort({ createdAt: -1 })
        .lean();

    const serialize = (value: any) => JSON.parse(JSON.stringify(value));

    // An order is worth showing only while something on it can still be sent back.
    const returnable = orders
        .filter(isReturnable)
        .filter((order: any) =>
            (order.products || []).some((_: any, i: number) => qtyReturnable(order, i) > 0)
        )
        .sort((a: any, b: any) => returnClockStart(b).getTime() - returnClockStart(a).getTime());

    const requests = orders
        .flatMap((order: any) =>
            (order.returnRequests || []).map((request: any) => ({
                ...request,
                orderId: String(order._id),
            }))
        )
        .sort(
            (a: any, b: any) =>
                new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
        );

    return (
        <ProfileShell title="Returns Center">
            <p className="-mt-4 mb-6 text-sm text-slate-700">
                Items can be returned within {RETURN_WINDOW_DAYS} days of delivery. Choose the item
                you want to send back and tell us what went wrong.
            </p>

            <ReturnsTabs active={tab} />

            {tab === "requests" &&
                (requests.length === 0
                    ? emptyState(
                          "You have no returns yet.",
                          "Return requests you submit will be listed here with their status."
                      )
                    : (
                        <div className="space-y-4 mt-6">
                            {requests.map((request: any, i: number) => (
                                <ReturnRequestCard key={i} request={serialize(request)} />
                            ))}
                        </div>
                    ))}

            {tab === "status" &&
                (requests.length === 0
                    ? emptyState(
                          "Nothing to track right now.",
                          "Once you request a return, its progress shows up here."
                      )
                    : (
                        <div className="space-y-8 mt-6">
                            {returnStatuses.map((status) => {
                                const group = requests.filter(
                                    (request: any) => request.status === status
                                );

                                return (
                                    <section key={status}>
                                        <h2 className="font-bold">
                                            {status}{" "}
                                            <span className="font-normal text-slate-600 text-sm">
                                                ({group.length})
                                            </span>
                                        </h2>

                                        {group.length === 0 ? (
                                            <p className="text-sm text-slate-600 mt-2">
                                                No items at this stage.
                                            </p>
                                        ) : (
                                            <div className="space-y-4 mt-3">
                                                {group.map((request: any, i: number) => (
                                                    <ReturnRequestCard
                                                        key={i}
                                                        request={serialize(request)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </section>
                                );
                            })}
                        </div>
                    ))}

            {!tab &&
                (returnable.length === 0
                    ? emptyState(
                          "No items are eligible for return.",
                          `Orders are returnable for ${RETURN_WINDOW_DAYS} days after they arrive.`
                      )
                    : (
                        <div className="space-y-6 mt-6">
                            {returnable.map((order: any) => (
                                <ReturnableOrderCard
                                    key={String(order._id)}
                                    order={serialize(order)}
                                    daysLeft={daysLeftToReturn(order)}
                                />
                            ))}
                        </div>
                    ))}
        </ProfileShell>
    );
};

export default Page;
