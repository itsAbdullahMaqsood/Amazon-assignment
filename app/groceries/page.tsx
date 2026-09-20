import Link from "next/link";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import MenuSideBar from "@/components/Header/MenuSidebar";
import GroceryNav from "@/components/grocery/GroceryNav";
import AisleTabs from "@/components/grocery/AisleTabs";
import GroceryRow from "@/components/grocery/GroceryRow";
import GroceryGrid from "@/components/grocery/GroceryGrid";
import { getGroceryStorefront } from "@/lib/grocery";
import { deliveryLabel } from "@/lib/recommendations";

export const metadata = {
    title: "Groceries",
};

// The green rule Amazon runs between the site header and the grocery storefront.
const GreenRule = () => <div className="h-[6px] bg-[#188C43]" />;

const Restocking = () => (
    <div className="max-w-2xl mx-auto my-24 px-6 text-center">
        <p className="text-lg">
            Our shelves are restocking.{" "}
            <Link href="/groceries" className="underline hover:text-[#C7511F]">
                Reload the page
            </Link>{" "}
            or check back shortly.
        </p>
        <p className="mt-4 text-sm text-slate-600">
            The grocery catalog is seeded separately: run <code>npm run seed:grocery</code>.
        </p>
    </div>
);

const Page = async ({ searchParams }: any) => {
    const query = (await searchParams) || {};
    const storefront = await getGroceryStorefront();
    const delivery = deliveryLabel();

    if (!storefront || storefront.total === 0) {
        return (
            <>
                <Header title="Groceries" />
                <GreenRule />

                <main className="bg-white min-h-screen">
                    <Restocking />
                </main>

                <Footer />
                <MenuSideBar />
            </>
        );
    }

    const { departments, deals, categoryId } = storefront;

    const department = departments.find((entry: any) => entry.slug === query.dept);
    const aisle = department?.aisles.find((entry: any) => entry.slug === query.aisle);

    return (
        <>
            <Header title="Groceries" />

            <GreenRule />

            <main className="bg-white min-h-screen pb-16">
                <GroceryNav
                    departments={departments}
                    active={department?.slug || "for-you"}
                    categoryId={categoryId}
                />

                {department && (
                    <AisleTabs
                        aisles={department.aisles}
                        department={department}
                        active={aisle?.slug}
                    />
                )}

                <div className="max-w-[1500px] mx-auto px-4">
                    {!department && (
                        <>
                            <GroceryRow
                                title="Deals in Grocery"
                                products={deals}
                                delivery={delivery}
                                href={`/browse?category=${categoryId}`}
                            />

                            {departments.map((entry: any) => (
                                <GroceryRow
                                    key={entry.slug}
                                    title={`Shop ${entry.name}`}
                                    products={entry.products}
                                    delivery={delivery}
                                    href={`/groceries?dept=${entry.slug}`}
                                />
                            ))}
                        </>
                    )}

                    {department && (
                        <GroceryGrid
                            title={aisle ? aisle.name : department.name}
                            products={aisle ? aisle.products : department.products}
                            delivery={delivery}
                        />
                    )}
                </div>
            </main>

            <Footer />

            <MenuSideBar />
        </>
    );
};

export default Page;
