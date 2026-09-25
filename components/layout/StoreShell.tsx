import connectDb from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import MenuSideBar from "@/components/Header/MenuSidebar";
import ShabanaPanel from "@/components/shabana/ShabanaPanel";
import Toaster from "@/components/ui/Toaster";
import { STOREFRONT_SLUGS } from "@/components/Header/navigation";

// Departments as the database has them, biggest first, so the nav never offers
// an empty aisle. Grocery and Furniture have their own storefronts, reached
// from "More stores", so the department row skips them; the search picker
// still offers every department.
const getDepartments = async () => {
    try {
        await connectDb();

        const [categories, counts] = await Promise.all([
            Category.find().select("name slug").lean(),
            Product.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
        ]);

        const countOf = new Map(counts.map((entry: any) => [String(entry._id), entry.count]));

        const all = (categories as any[])
            .map((category) => ({
                name: category.name,
                slug: category.slug,
                count: countOf.get(String(category._id)) || 0,
            }))
            .filter((category) => category.count > 0)
            .sort((a, b) => b.count - a.count);

        return {
            nav: all.filter((category) => !STOREFRONT_SLUGS.includes(category.slug)),
            search: [...all].sort((a, b) => a.name.localeCompare(b.name)),
        };
    } catch {
        // No database: the header still renders, just without departments.
        return { nav: [], search: [] };
    }
};

// Everything a shopper sees around a page: header, drawer, footer, the
// assistant and toasts. The (store) route group renders it once for every page
// inside it; the root not-found and forbidden pages render it themselves.
const StoreShell = async ({ children }: any) => {
    const departments = await getDepartments();

    return (
        <div className="flex min-h-dvh flex-col">
            <a
                href="#content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[80] focus:rounded-card focus:bg-surface focus:px-4 focus:py-2 focus:shadow-pop"
            >
                Skip to content
            </a>

            <Header departments={departments.nav} searchDepartments={departments.search} />

            <div id="content" className="flex-1">
                {children}
            </div>

            <Footer />

            <MenuSideBar departments={departments.nav} />

            <ShabanaPanel />

            <Toaster />
        </div>
    );
};

export default StoreShell;
