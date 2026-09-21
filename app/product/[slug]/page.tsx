import { cache } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import User from "@/models/User";
import Header from "@/components/Header/Header";
import MenuSideBar from "@/components/Header/MenuSidebar";
import Footer from "@/components/Footer";
import ProductPage from "@/components/ProductPage/ProductPage";
import { recordProductView } from "@/lib/recommendations";
import { resolveSizeIndex } from "@/utils/sizes";
import { HISTORY_COOKIE } from "@/lib/preferences";

const applyDiscount = (price: number, discount: number) =>
    discount > 0 ? price - price / 100 * discount : price;

// Cached so generateMetadata and the page share one query. Resolving (and 404ing)
// in generateMetadata happens before the shell streams, so a missing product gets a
// real 404 status instead of a 200 carrying the not-found UI.
const getProduct = cache(async (slug: string, style: number, sizeParam: any) => {
    await connectDb();

    const product: any = await Product.findOne({ slug })
        .populate({ path: "category", model: Category })
        .populate({ path: "subCategories", model: SubCategory })
        // Selected down to what a review card shows: the whole product document
        // is serialized to the client, and a reviewer's account has no business
        // travelling with it.
        .populate({ path: "reviews.reviewBy", model: User, select: "name image" })
        .lean();

    if (!product) {
        return null;
    }

    const subProduct = product.subProducts?.[style];

    // A product with one size row (most of the catalogue) has nothing to pick,
    // so the page resolves a size itself instead of waiting for ?size= .
    const size = resolveSizeIndex(subProduct?.sizes, sizeParam);

    if (!subProduct || !subProduct.sizes?.[size]) {
        return null;
    }

    const discount = subProduct.discount || 0;
    const prices = subProduct.sizes
        .map((s: any) => s.price)
        .sort((a: number, b: number) => a - b);
    const discounted = discount > 0;

    const priceRange = discounted
        ? `From ${applyDiscount(prices[0], discount).toFixed(2)} to ${applyDiscount(
              prices[prices.length - 1],
              discount
          ).toFixed(2)}$`
        : `From ${prices[0]} to ${prices[prices.length - 1]}$`;

    const reviews = product.reviews || [];
    const ratings = [5, 4, 3, 2, 1].map((rating) => ({
        percentage: (
            (reviews.filter((review: any) => review.rating === rating || review.rating === rating + 0.5)
                .length *
                100) /
            (reviews.length || 1)
        ).toFixed(1),
    }));

    const allSizes = product.subProducts
        .flatMap((p: any) => p.sizes)
        .sort((a: any, b: any) => (a.size > b.size ? 1 : -1))
        .filter(
            (element: any, index: number, array: any[]) =>
                array.findIndex((s: any) => s.size === element.size) === index
        );

    return {
        ...product,
        style,
        size,
        images: subProduct.images,
        sizes: subProduct.sizes,
        discount,
        sku: subProduct.sku,
        colors: product.subProducts.map((p: any) => p.color),
        priceRange,
        price: discounted
            ? Number(applyDiscount(subProduct.sizes[size].price, discount).toFixed(2))
            : subProduct.sizes[size].price,
        priceBefore: subProduct.sizes[size].price,
        quantity: subProduct.sizes[size].qty,
        ratings,
        allSizes,
    };
});

const getSimilarProducts = cache(async (categoryId: string, currentId: string) => {
    const products: any[] = await Product.find({
        category: categoryId,
        _id: { $ne: currentId },
    })
        .limit(12)
        .lean();

    return products.map((product: any) => ({
        _id: String(product._id),
        name: product.name,
        slug: product.slug,
        image: product.subProducts?.[0]?.images?.[0]?.url || "",
    }));
});

export const generateMetadata = async ({ params, searchParams }: any) => {
    const { slug } = await params;
    const query = await searchParams;
    const product = await getProduct(slug, Number(query?.style) || 0, query?.size);

    if (!product) {
        notFound();
    }

    return { title: product.name };
};

const Page = async ({ params, searchParams }: any) => {
    const { slug } = await params;
    const query = await searchParams;
    const style = Number(query?.style) || 0;

    const product = await getProduct(slug, style, query?.size);

    if (!product) {
        notFound();
    }

    const session = await auth();

    // Browsing history is recorded here, so the account page's carousels run on
    // what the user actually looked at — unless they turned that off in
    // /profile/preferences, which mirrors the switch into a cookie.
    const historyOff = (await cookies()).get(HISTORY_COOKIE)?.value === "0";

    if (session && !historyOff) {
        await recordProductView(session.user.id, String(product._id), style);
    }

    const serialized = JSON.parse(JSON.stringify(product));
    const similar = await getSimilarProducts(String(product.category?._id), String(product._id));

    return (
        <>
            <Header title={serialized.name} />

            <main className="bg-white w-full">
                <ProductPage product={serialized} similar={similar} />
            </main>

            <Footer />

            <MenuSideBar />
        </>
    );
};

export default Page;
