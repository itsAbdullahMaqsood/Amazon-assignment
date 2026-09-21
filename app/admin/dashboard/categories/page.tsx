import { requireAdminPage } from "@/lib/guard";
import { PageHeader } from "@/components/admin/ui";
import CatalogManager from "@/components/admin/catalog/CatalogManager";
import { listCategories } from "@/components/admin/catalog/queries";

export const metadata = { title: "Categories" };

const CategoriesPage = async () => {
    await requireAdminPage("/admin/dashboard/categories");

    const categories = await listCategories();

    return (
        <>
            <PageHeader
                title="Categories"
                description="Top-level departments shoppers browse by. A category can only be deleted once nothing uses it."
            />
            <CatalogManager kind="category" initial={categories} />
        </>
    );
};

export default CategoriesPage;
