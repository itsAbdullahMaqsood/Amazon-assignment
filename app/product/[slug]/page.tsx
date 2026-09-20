import { cache } from "react";
import { notFound } from "next/navigation";

import connectDb from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import User from "@/models/User";
import Header from "@/components/Header/Header";
import MenuSideBar from "@/components/Header/MenuSidebar";
import Footer from "@/components/Footer";
import ProductPage from "@/components/ProductPage/ProductPage";

const applyDiscount = (price: number, discount: number) =>
    discount > 0 ? price - price / 100 * discount : price;

// Cached so generateMetadata and the page share one query. Resolving (and 404ing)
// in generateMetadata happens before the shell streams, so a missing product gets a
// real 404 status instead of a 200 carrying the not-found UI.
const getProduct = cache(async (slug: string, style: number, size: number) => {
    await connectDb();

    const product: any = await Product.findOne({ slug })
        .populate({ path: "category", model: Category })
        .populate({ path: "subCategories", model: SubCategory })
        .populate({ path: "reviews.reviewBy", model: User })
        .lean();

    if (!product) {
        return null;
    }

    const subProduct = product.subProducts?.[style];

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
    const product = await getProduct(slug, Number(query?.style) || 0, Number(query?.size) || 0);

    if (!product) {
        notFound();
    }

    return { title: product.name };
};

const Page = async ({ params, searchParams }: any) => {
    const { slug } = await params;
    const query = await searchParams;
    const style = Number(query?.style) || 0;
    const size = Number(query?.size) || 0;

    const product = await getProduct(slug, style, size);

    if (!product) {
        notFound();
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
