import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Order from "@/models/Order";
import ViewedStrip from "@/components/keepShopping/ViewedStrip";
import PreviouslyViewed from "@/components/keepShopping/PreviouslyViewed";
import KeepShoppingTabs from "@/components/keepShopping/KeepShoppingTabs";
import FilterBar from "@/components/keepShopping/FilterBar";
import ProductGrid from "@/components/keepShopping/ProductGrid";
import { deliveryLabel } from "@/lib/recommendations";
import { toKeepShoppingProduct, withinPrice } from "@/lib/keepShopping";
import { keepShoppingTabs } from "@/components/keepShopping/filters";

const GRID_SIZE = 24;
// A price filter is applied to the shaped cards, so the query has to hand back
// more than one grid's worth to filter down from.
const POOL_SIZE = 120;
// Below this a subcategory is too thin to fill a grid, so the whole department
// stands in for it.
const MIN_SCOPE = 8;

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Keep shopping for",
};

const sorts: any = {
    "for-you": { rating: -1, numberReviews: -1 },
    deals: { "subProducts.discount": -1, rating: -1 },
    "best-sellers": { "subProducts.sold": -1, rating: -1 },
    "bought-together": { "subProducts.sold": -1 },
};

// The products bought in the same orders as anything the shopper has viewed.
const coPurchased = async (viewedIds: any[]) => {
    const orders = await Order.find({ "products.product": { $in: viewedIds } })
        .select("products.product")
        .limit(200)
        .lean();

    const seen = new Set(viewedIds.map(String));

    return orders
        .flatMap((order: any) => order.products || [])
        .map((line: any) => String(line.product))
        .filter((id: string) => id && !seen.has(id));
};

const Page = async ({ searchParams }: any) => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/keep-shopping");
    }

    const query = (await searchParams) || {};
    const tab = keepShoppingTabs.some((entry) => entry.value === query.tab)
        ? query.tab
        : "for-you";

    await connectDb();

    const user: any = await User.findById(session.user.id)
        .select("recentlyViewed")
        .populate({ path: "recentlyViewed.product", model: Product })
        .lean();

    const viewed = (user?.recentlyViewed || []).filter((entry: any) => entry.product);
    const delivery = deliveryLabel();
    const serialize = (value: any) => JSON.parse(JSON.stringify(value));

    if (viewed.length === 0) {
        return (
            <>

                <main className="bg-white min-h-screen">
                    <div className="max-w-[1500px] mx-auto px-6 py-16 text-center">
                        <h1 className="text-3xl font-bold">Keep shopping for</h1>
                        <p className="mt-3 text-slate-700">
                            Nothing to pick up yet — the products you view show up here.
                        </p>
                        <Link
                            href="/browse"
                            className="inline-block mt-6 px-6 py-2 rounded-full bg-accent text-ink-900"
                        >
                            Browse the catalog
                        </Link>
                    </div>
                </main>


            </>
        );
    }

    // The most recent view sets what the page is "for"; its subcategory names the
    // heading and scopes the grid.
    const latest = viewed[0];
    const focusSubId = latest.product.subCategories?.[0];
    const viewedIds = viewed.map((entry: any) => entry.product._id);

    const [focusSub, focusCategory, scopeCount] = await Promise.all([
        focusSubId ? SubCategory.findById(focusSubId).select("name").lean() : null,
        Category.findById(latest.product.category).select("name").lean(),
        focusSubId ? Product.countDocuments({ subCategories: focusSubId }) : 0,
    ]);

    const scope =
        focusSubId && scopeCount >= MIN_SCOPE
            ? { subCategories: focusSubId }
            : { category: latest.product.category };

    const heading = (focusSub as any)?.name || (focusCategory as any)?.name || "your recent views";

    // One thumbnail per listing, captioned with how many history entries it holds.
    const thumbnails = viewed
        .filter((entry: any) =>
            focusSubId
                ? (entry.product.subCategories || []).some(
                      (id: any) => String(id) === String(focusSubId)
                  )
                : true
        )
        .reduce((acc: any[], entry: any) => {
            const id = String(entry.product._id);
            const existing = acc.find((item) => item._id === id);

            if (existing) {
                existing.views += 1;
                return acc;
            }

            const style = Number(entry.style) || 0;
            const variant = entry.product.subProducts?.[style] || entry.product.subProducts?.[0];

            return [
                ...acc,
                {
                    _id: id,
                    slug: entry.product.slug,
                    name: entry.product.name,
                    style,
                    image: variant?.images?.[0]?.url || "",
                    views: 1,
                },
            ];
        }, []);

    const filters: any = {
        ...scope,
        _id: { $nin: viewedIds },
        ...(query.rating && { rating: { $gte: Number(query.rating) } }),
        ...(tab === "deals" && { "subProducts.discount": { $gt: 0 } }),
    };

    if (tab === "bought-together") {
        const coIds = await coPurchased(viewedIds);

        // With no shared orders yet, the department's own best sellers stand in.
        if (coIds.length > 0) {
            filters._id = { $in: coIds, $nin: viewedIds };
            delete filters.category;
            delete filters.subCategories;
        }
    }

    const products = await Product.find(filters)
        .sort(sorts[tab])
        .limit(query.price ? POOL_SIZE : GRID_SIZE)
        .lean();

    const cards = products
        .map((product: any) => toKeepShoppingProduct(product))
        .filter(withinPrice(query.price))
        .slice(0, GRID_SIZE);

    // One ad slot, given to the best seller already on the page.
    const sponsoredId = [...cards].sort((a, b) => b.sold - a.sold)[0]?._id || "";

    return (
        <>

            <main className="bg-white min-h-screen">
                <div className="max-w-[1500px] mx-auto px-6">
                    <ViewedStrip heading={heading} items={serialize(thumbnails)} />

                    <PreviouslyViewed
                        product={serialize(
                            toKeepShoppingProduct(latest.product, Number(latest.style) || 0)
                        )}
                        delivery={delivery}
                    />

                    <KeepShoppingTabs active={tab} />

                    <FilterBar current={query} />

                    <ProductGrid
                        products={serialize(cards)}
                        delivery={delivery}
                        sponsoredId={sponsoredId}
                    />
                </div>
            </main>


        </>
    );
};

export default Page;
