import Link from "next/link";
import Image from "next/image";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/models/Order";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import MenuSideBar from "@/components/Header/MenuSidebar";
import HelpSearch from "@/components/customerService/HelpSearch";
import TopicTiles from "@/components/customerService/TopicTiles";
import ContactPanel from "@/components/customerService/ContactPanel";
import { quickLinks, topicList } from "@/lib/customerService";
import { formatDate, orderNumber } from "@/lib/returns";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Customer Service",
};

const recentOrders = async (userId: string) => {
    await connectDb();

    const clause: any = { user: userId };

    const orders: any = await Order.find(clause)
        .select("products total createdAt status")
        .sort({ createdAt: -1 })
        .limit(2)
        .lean();

    return JSON.parse(JSON.stringify(orders));
};

const Page = async () => {
    const session = await auth();
    const orders = session ? await recentOrders(session.user.id) : [];
    const topics = topicList();

    return (
        <>
            <Header title="Customer Service" />

            <main className="bg-[#F7F8F8] min-h-[60vh]">
                <section className="bg-amazon-blue_light text-white">
                    <div className="max-w-[1000px] mx-auto px-4 py-10 text-center">
                        <h1 className="text-2xl md:text-3xl font-bold">
                            Hello. What can we help you with?
                        </h1>
                        <p className="text-sm text-slate-300 mt-2 mb-6">
                            Search our help library, or pick a topic below.
                        </p>

                        <HelpSearch topics={topics} />
                    </div>
                </section>

                <div className="max-w-[1000px] mx-auto px-4 py-8 space-y-10">
                    {session && (
                        <section>
                            <h2 className="text-xl font-bold mb-4">Your recent orders</h2>

                            {orders.length === 0 ? (
                                <div className="border border-slate-300 rounded-lg bg-white p-6 text-center">
                                    <p className="font-semibold">You haven&apos;t placed an order yet.</p>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Once you do, it will show up here so you can get help with it
                                        in one click.
                                    </p>
                                    <Link
                                        href="/browse"
                                        className="inline-block mt-4 px-6 py-2 rounded-full bg-linear-to-r from-amazon-orange to-yellow-300 text-amazon-blue_dark"
                                    >
                                        Start shopping
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {orders.map((order: any) => (
                                        <article
                                            key={order._id}
                                            className="border border-slate-300 rounded-lg bg-white p-4"
                                        >
                                            <p className="text-xs text-slate-600">
                                                Ordered {formatDate(order.createdAt)} · #
                                                {orderNumber(order._id)}
                                            </p>

                                            <div className="flex gap-3 mt-3">
                                                {order.products.slice(0, 3).map((item: any, i: number) => (
                                                    <Image
                                                        key={i}
                                                        src={item.image}
                                                        alt={item.name}
                                                        width={56}
                                                        height={56}
                                                        className="rounded object-contain w-14 h-14 bg-white"
                                                    />
                                                ))}

                                                <div className="min-w-0 text-sm">
                                                    <p className="line-clamp-2">
                                                        {order.products[0]?.name}
                                                    </p>
                                                    {order.products.length > 1 && (
                                                        <p className="text-xs text-slate-600 mt-1">
                                                            and {order.products.length - 1} more item
                                                            {order.products.length > 2 ? "s" : ""}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-4 mt-4 text-sm">
                                                <Link
                                                    href="/profile/returns"
                                                    className="text-[#0F5FA6] hover:text-[#C7511F] hover:underline"
                                                >
                                                    Problem with order
                                                </Link>
                                                <Link
                                                    href={`/order/${order._id}`}
                                                    className="text-[#0F5FA6] hover:text-[#C7511F] hover:underline"
                                                >
                                                    View order details
                                                </Link>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    <section>
                        <h2 className="text-xl font-bold mb-4">Browse help topics</h2>
                        <TopicTiles topics={topics} />
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4">Some things you can do here</h2>

                        <ul className="border border-slate-300 rounded-lg bg-white divide-y divide-slate-200">
                            {quickLinks.map((quick) => (
                                <li key={quick.href + quick.label}>
                                    <Link
                                        href={quick.href}
                                        className="block px-5 py-3 text-sm text-[#0F5FA6] hover:text-[#C7511F] hover:underline"
                                    >
                                        {quick.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-1">Need more help?</h2>
                        <p className="text-sm text-slate-600 mb-4">
                            Help articles cover most questions. The contact options below explain
                            what this build can and cannot do.
                        </p>

                        <ContactPanel />
                    </section>
                </div>
            </main>

            <Footer />

            <MenuSideBar />
        </>
    );
};

export default Page;
