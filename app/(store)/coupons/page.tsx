import { Suspense } from "react";

import connectDb from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import DealsTabs from "@/components/coupons/DealsTabs";
import SponsoredStrip from "@/components/coupons/SponsoredStrip";
import PrimeBanner from "@/components/coupons/PrimeBanner";
import FeaturedDeals from "@/components/coupons/FeaturedDeals";
import CouponsClient from "@/components/coupons/CouponsClient";
import { toCouponProduct } from "@/lib/coupons";

const PAGE_SIZE = 20;
const FEATURED_COUNT = 14;

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Coupons",
};

// A coupon is a discounted colour variant: the catalog has no separate coupon
// entity, so every listing that carries a discount is clippable here.
const COUPON_PRODUCTS = { "subProducts.discount": { $gt: 0 } };

const buildFilters = (query: any) => {
    const { category, sub, rating, price, discount } = query;
    const [min, max] = String(price || "").split("_");

    return {
        ...COUPON_PRODUCTS,
        ...(discount && { "subProducts.discount": { $gte: Number(discount) } }),
        ...(category && { category }),
        ...(sub && { subCategories: sub }),
        ...(rating && { rating: { $gte: Number(rating) } }),
        ...(price && {
            "subProducts.sizes.price": {
                $gte: Number(min) || 0,
                $lte: Number(max) || Infinity,
            },
        }),
    };
};

// The slider stops on a round number just above the dearest coupon product.
const priceCeiling = async () => {
    const [top]: any[] = await Product.aggregate([
        { $match: COUPON_PRODUCTS },
        { $unwind: "$subProducts" },
        { $unwind: "$subProducts.sizes" },
        { $group: { _id: null, max: { $max: "$subProducts.sizes.price" } } },
    ]);

    return Math.max(100, Math.ceil((top?.max || 0) / 100) * 100);
};

const GridSkeleton = () => (
    <div className="max-w-[1500px] mx-auto px-4 py-4">
        <div className="h-12 rounded bg-slate-100" />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
            <div className="h-[520px] rounded bg-slate-100" />
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-x-5 gap-y-8">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="h-[340px] rounded bg-slate-100" />
                ))}
            </div>
        </div>
    </div>
);

const Page = async ({ searchParams }: any) => {
    const query = (await searchParams) || {};
    const page = Number(query.page) > 0 ? Number(query.page) : 1;

    await connectDb();

    const filters = buildFilters(query);

    const [products, total, ceiling, categories, subCategories, featured] = await Promise.all([
        Product.find(filters)
            .sort({ "subProducts.discount": -1, rating: -1 })
            .skip(PAGE_SIZE * (page - 1))
            .limit(PAGE_SIZE)
            .lean(),
        Product.countDocuments(filters),
        priceCeiling(),
        Category.find().lean(),
        SubCategory.find().lean(),
        Product.find(COUPON_PRODUCTS)
            .sort({ "subProducts.discount": -1, "subProducts.sold": -1 })
            .limit(FEATURED_COUNT)
            .lean(),
    ]);

    const deals = featured.map(toCouponProduct);
    // The ad rail runs on the best seller among the deals already on the page.
    const sponsored = [...deals].sort((a, b) => b.sold - a.sold)[0] || null;

    const chips = [
        ...categories.map((category: any) => ({
            _id: String(category._id),
            name: category.name,
            kind: "category",
        })),
        ...subCategories.map((sub: any) => ({
            _id: String(sub._id),
            name: sub.name,
            kind: "sub",
        })),
    ];

    const serialize = (value: any) => JSON.parse(JSON.stringify(value));

    return (
        <>

            <main className="bg-white min-h-screen">
                <DealsTabs active="Coupons" />

                <SponsoredStrip product={sponsored} />

                <PrimeBanner />

                <FeaturedDeals deals={serialize(deals)} />

                {/* The grid reads its filters from the query string, so it is client
                    rendered. The boundary keeps everything above it in the server HTML
                    instead of dragging the whole page into the browser. */}
                <Suspense fallback={<GridSkeleton />}>
                    <CouponsClient
                        products={serialize(products.map(toCouponProduct))}
                        categories={serialize(
                            categories.map((category: any) => ({
                                _id: String(category._id),
                                name: category.name,
                            }))
                        )}
                        subCategories={serialize(
                            subCategories.map((sub: any) => ({ _id: String(sub._id), name: sub.name }))
                        )}
                        chips={chips}
                        ceiling={ceiling}
                        total={total}
                        page={page}
                        paginationCount={Math.ceil(total / PAGE_SIZE)}
                    />
                </Suspense>
            </main>


        </>
    );
};

export default Page;
