import connectDb from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Header from "@/components/Header/Header";
import MenuSideBar from "@/components/Header/MenuSidebar";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/Home/HeroCarousel";
import CategoriesProducts from "@/components/Home/CategoriesProduct/CategoriesProducts";
import HomeProductSwiper from "@/components/Home/HomeProductSwiper";

// Rendered per request: the catalog changes independently of deploys, and this
// keeps `next build` from needing a live database connection.
export const dynamic = "force-dynamic";

const Home = async () => {
    await connectDb();

    const products = await Product.find()
        .populate({ path: "category", model: Category })
        .sort({ updatedAt: -1 })
        .lean();

    const serialized = JSON.parse(JSON.stringify(products));

    return (
        <>
            <Header title="Full Amazon Clone React" />

            <main className="max-w-screen-2xl mx-auto bg-gray-100">
                <HeroCarousel />

                <CategoriesProducts products={serialized} />

                <div className="z-10 relative">
                    <HomeProductSwiper products={serialized} category="women clothing" />
                    <HomeProductSwiper products={serialized} category="shoes" />
                    <HomeProductSwiper products={serialized} category="Beauty" />
                    <HomeProductSwiper products={serialized} category="Kids" />
                </div>
            </main>

            <Footer />

            <MenuSideBar />
        </>
    );
};

export default Home;
