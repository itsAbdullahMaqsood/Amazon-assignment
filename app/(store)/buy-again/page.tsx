import Link from "next/link";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Order from "@/models/Order";
import SubTabs from "@/components/buyAgain/SubTabs";
import OrdersSearch from "@/components/orders/OrdersSearch";
import AislesRow from "@/components/buyAgain/AislesRow";
import ProductRow from "@/components/buyAgain/ProductRow";
import RecommendationCarousel from "@/components/profile/RecommendationCarousel";
import { deliveryLabel, getRecommendations, toCardProduct } from "@/lib/recommendations";

export const metadata = {
    title: "Buy Again",
};

const rowProduct = (product: any) => {
    const card = toCardProduct(product);
    const detail = (product.details || []).find((entry: any) => entry.name !== "Brand");

    return {
        ...card,
        // The attribute line under the title, e.g. "Alkaline · 20 Count".
        attributes: [product.brand, detail?.value].filter(Boolean).join(" · "),
    };
};

const Page = async () => {
    const session = await auth();

    await connectDb();

    const [categories, subCategories] = await Promise.all([
        Category.find().lean(),
        SubCategory.find().lean(),
    ]);

    // One aisle per subcategory, illustrated by a product that sits in it.
    const aisles = await Promise.all(
        subCategories.map(async (sub: any) => {
            const product: any = await Product.findOne({ subCategories: sub._id })
                .select("subProducts category")
                .lean();

            return {
                _id: String(sub._id),
                name: sub.name,
                categoryId: String(product?.category || ""),
                image: product?.subProducts?.[0]?.images?.[0]?.url || "",
            };
        })
    );

    // Top sellers per category, ordered by what has actually sold.
    const topSellers = await Promise.all(
        categories.map(async (category: any) => {
            const products = await Product.find({ category: category._id })
                .sort({ "subProducts.sold": -1, rating: -1 })
                .limit(12)
                .lean();

            return { title: `Top sellers in ${category.name}`, products: products.map(rowProduct) };
        })
    );

    // "Buy again" is the user's own purchase history, de-duplicated by product.
    let buyAgain: any[] = [];

    if (session) {
        const orders = await Order.find({ user: session.user.id })
            .populate({ path: "products.product", model: Product })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        const seen = new Set<string>();

        buyAgain = orders
            .flatMap((order: any) => order.products || [])
            .filter((line: any) => line.product)
            .filter((line: any) => {
                const id = String(line.product._id);
                if (seen.has(id)) return false;
                seen.add(id);
                return true;
            })
            .map((line: any) => rowProduct(line.product));
    }

    const { alsoViewed, related } = session
        ? await getRecommendations(session.user.id)
        : { alsoViewed: [], related: [] };

    const delivery = deliveryLabel();
    const serialize = (value: any) => JSON.parse(JSON.stringify(value));

    return (
        <>

            <main className="bg-white min-h-screen">
                <SubTabs active="Buy Again" />

                <div className="max-w-[1500px] mx-auto px-6 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h1 className="text-3xl font-bold">Buy Again</h1>
                        <OrdersSearch />
                    </div>

                    {buyAgain.length > 0 ? (
                        <ProductRow
                            title="Your previous purchases"
                            products={serialize(buyAgain)}
                            delivery={delivery}
                        />
                    ) : (
                        <p className="text-center my-10">
                            There are no recommended items for you to buy again at this time. Check{" "}
                            <Link href="/profile/orders" className="text-accent-ink hover:underline">
                                Your Orders
                            </Link>{" "}
                            for items you previously purchased.
                        </p>
                    )}

                    <h2 className="text-2xl font-bold mt-8">Discover</h2>

                    <AislesRow aisles={serialize(aisles.filter((aisle) => aisle.image))} />

                    {topSellers.map((row) => (
                        <ProductRow
                            key={row.title}
                            title={row.title}
                            products={serialize(row.products)}
                            delivery={delivery}
                        />
                    ))}

                    <RecommendationCarousel
                        title="Customers who viewed items in your browsing history also viewed"
                        products={serialize(alsoViewed)}
                        delivery={delivery}
                    />

                    <RecommendationCarousel
                        title="Related to items you viewed"
                        products={serialize(related)}
                        delivery={delivery}
                    />
                </div>
            </main>


        </>
    );
};

export default Page;
