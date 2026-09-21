import { requireAdminPage } from "@/lib/guard";
import { PageHeader } from "@/components/admin/ui";
import CatalogManager from "@/components/admin/catalog/CatalogManager";
import { listCategoryOptions, listSubCategories } from "@/components/admin/catalog/queries";

export const metadata = { title: "Sub-Categories" };

const SubCategoriesPage = async () => {
    await requireAdminPage("/admin/dashboard/sub-categories");

    const [subCategories, parents] = await Promise.all([listSubCategories(), listCategoryOptions()]);

    return (
        <>
            <PageHeader
                title="Sub-Categories"
                description="Narrower groupings inside a category. Each one belongs to exactly one parent."
            />
            <CatalogManager kind="subcategory" initial={subCategories} parents={parents} />
        </>
    );
};

export default SubCategoriesPage;
