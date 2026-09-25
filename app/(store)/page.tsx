import { auth } from "@/auth";
import { getHomeData } from "@/lib/home";
import { Container } from "@/components/ui/Layout";
import Hero from "@/components/landing/Hero";
import DepartmentGrid from "@/components/landing/DepartmentGrid";
import ProductRail from "@/components/landing/ProductRail";
import MoviesStrip from "@/components/landing/MoviesStrip";

// Rendered per request: the catalogue changes independently of deploys, and
// this keeps `next build` from needing a live database connection.
export const dynamic = "force-dynamic";

const Home = async () => {
    const session = await auth();
    const data = await getHomeData(session?.user?.id);
    const firstName = session?.user?.name ? String(session.user.name).split(" ")[0] : "";

    return (
        <main>
            <Container className="space-y-12 pt-4 md:space-y-16 md:pt-6">
                <Hero departments={data.departments} productCount={data.productCount} firstName={firstName} />

                <ProductRail
                    title="Pick up where you left off"
                    description="Things you looked at recently"
                    href="/profile/recent"
                    linkLabel="Your history"
                    products={data.recent}
                />

                <DepartmentGrid departments={data.departments} />

                <ProductRail
                    title="On sale now"
                    description="The biggest real discounts in the catalogue"
                    href="/coupons"
                    linkLabel="All deals"
                    products={data.deals}
                />

                <ProductRail
                    title="Buy again"
                    description="From your past orders"
                    href="/buy-again"
                    products={data.buyAgain}
                />

                <ProductRail
                    title="Top rated"
                    description="4.5 stars and up, from at least three reviews"
                    href="/browse?sort=topReviewed"
                    products={data.topRated}
                />

                <MoviesStrip movies={data.movies} />
            </Container>
        </main>
    );
};

export default Home;
