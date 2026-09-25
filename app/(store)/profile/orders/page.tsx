import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { escapeRegex } from "@/utils/regex";
import { DEFAULT_RANGE, fallbackRange, rangeClause, rangeSentence } from "@/lib/orders";
import { deliveryLabel, getRecommendations, toCardProduct } from "@/lib/recommendations";
import OrderTabs from "@/components/orders/OrderTabs";
import OrdersSearch from "@/components/orders/OrdersSearch";
import TimeFilter from "@/components/orders/TimeFilter";
import OrderCard from "@/components/orders/OrderCard";
import { isReturnable } from "@/lib/returns";
import SponsoredOrder from "@/components/orders/SponsoredOrder";
import RecommendationCarousel from "@/components/profile/RecommendationCarousel";

export const metadata = {
    title: "Your Orders",
};

const Page = async ({ searchParams }: any) => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/orders");
    }

    const query = await searchParams;
    const tab = query?.tab || "";
    const time = query?.time || DEFAULT_RANGE;
    const search = query?.search || "";

    // Carried by the tabs, the dropdown and the search box so that switching one
    // of them keeps the other two.
    const params = new URLSearchParams(
        Object.entries({ tab, time, search }).filter(([, value]) => value) as any
    ).toString();

    await connectDb();

    const clause: any = { user: session.user.id, createdAt: rangeClause(time) };

    if (tab === "not-shipped") {
        clause.status = { $in: ["Not Processed", "Processing"] };
    }

    if (search) {
        clause["products.name"] = { $regex: escapeRegex(search), $options: "i" };
    }

    // Nothing in this catalogue is a digital good, so that tab has no query to run.
    const orders =
        tab === "digital"
            ? []
            : await Order.find(clause)
                  .populate({ path: "products.product", model: Product, select: "slug" })
                  .sort({ createdAt: -1 })
                  .lean();

    const [sponsored, recommendations] = await Promise.all([
        Product.findOne().sort({ rating: -1, "subProducts.sold": -1 }).lean(),
        getRecommendations(session.user.id),
    ]);

    const serialize = (value: any) => JSON.parse(JSON.stringify(value));
    const nextRange = fallbackRange(time);

    return (
        <>

            <main className="bg-white min-h-[60vh]">
                <div className="max-w-[1180px] mx-auto px-4 py-6">
                    <nav aria-label="Breadcrumb" className="flex items-center text-sm">
                        <Link href="/profile" className="text-accent-ink hover:text-accent-deep hover:underline">
                            Your Account
                        </Link>
                        <ChevronRightIcon className="h-3 mx-1 text-slate-500" />
                        <span className="text-accent-deep">Your Orders</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-3">
                        <h1 className="text-3xl font-bold">Your Orders</h1>
                        <OrdersSearch initial={search} params={params} />
                    </div>

                    <div className="mt-6">
                        <OrderTabs active={tab} params={params} />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 mt-6 text-sm">
                        <div className="flex items-center gap-2">
                            <span>
                                <span className="font-bold">
                                    {orders.length} order{orders.length === 1 ? "" : "s"}
                                </span>{" "}
                                placed in
                            </span>
                            <TimeFilter value={time} params={params} />
                        </div>

                        <Link
                            href="/profile/payment"
                            className="text-accent-ink font-bold hover:text-accent-deep hover:underline"
                        >
                            View transactions
                        </Link>
                    </div>

                    {search && (
                        <p className="mt-4 text-sm">
                            Showing orders matching{" "}
                            <span className="font-semibold">&quot;{search}&quot;</span>{" "}
                            <Link
                                href={tab ? `/profile/orders?tab=${tab}&time=${time}` : `/profile/orders?time=${time}`}
                                className="text-accent-ink hover:text-accent-deep hover:underline"
                            >
                                clear
                            </Link>
                        </p>
                    )}

                    {orders.length > 0 ? (
                        <div className="space-y-6 mt-6">
                            {orders.map((order: any) => (
                                <OrderCard
                                    key={String(order._id)}
                                    order={serialize(order)}
                                    returnable={isReturnable(order)}
                                />
                            ))}
                        </div>
                    ) : tab === "digital" ? (
                        <p className="text-center my-14">
                            You have no digital orders. Digital purchases, such as{" "}
                            <Link href="/movies" className="text-accent-ink hover:text-accent-deep hover:underline">
                                Markaz Movies
                            </Link>{" "}
                            rentals, are shown here.
                        </p>
                    ) : (
                        <p className="text-center my-14">
                            Looks like you haven&apos;t placed an order {rangeSentence(time)}.{" "}
                            <Link
                                href={`/profile/orders?${new URLSearchParams({
                                    ...(tab ? { tab } : {}),
                                    ...(search ? { search } : {}),
                                    time: nextRange,
                                }).toString()}`}
                                className="text-accent-ink hover:text-accent-deep hover:underline"
                            >
                                View orders in {nextRange}
                            </Link>
                        </p>
                    )}

                    <SponsoredOrder product={sponsored ? serialize(toCardProduct(sponsored)) : null} />
                </div>

                <section className="border-t border-slate-200">
                    <div className="max-w-[1500px] mx-auto px-6 pb-8">
                        <RecommendationCarousel
                            title="Customers who viewed items in your browsing history also viewed"
                            products={serialize(recommendations.alsoViewed)}
                            delivery={deliveryLabel()}
                        />
                    </div>
                </section>
            </main>


        </>
    );
};

export default Page;
