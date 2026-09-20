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

const getProduct = async (slug: string, style: number, size: number) => {
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
};

export const generateMetadata = async ({ params }: any) => {
    const { slug } = await params;

    await connectDb();
    const product: any = await Product.findOne({ slug }).select("name").lean();

    return { title: product?.name || "Product" };
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

    return (
        <>
            <Header title={serialized.name} />

            <main className="bg-white w-full">
                <ProductPage product={serialized} />
            </main>

            <Footer />

            <MenuSideBar />
        </>
    );
};

export default Page;
