import connectDb from "@/lib/db";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Product from "@/models/Product";
import { requireAdminPage } from "@/lib/guard";
import { PageHeader } from "@/components/admin/ui";
import ProductForm from "@/components/admin/product/ProductForm";

export const metadata = { title: "Create product" };

const Page = async () => {
    await requireAdminPage("/admin/dashboard/product/create");
    await connectDb();

    const [categories, subCategories, products] = await Promise.all([
        Category.find().sort({ name: 1 }).lean(),
        SubCategory.find().sort({ name: 1 }).lean(),
        Product.find().select("name subProducts._id").sort({ name: 1 }).lean(),
    ]);

    const parents = products.map((p: any) => ({
        _id: String(p._id),
        name: p.name,
        variants: (p.subProducts || []).length,
    }));

    return (
        <>
            <PageHeader
                title="Create product"
                description="Publish a new listing, or add another colour to one that already exists."
            />
            <ProductForm
                mode="create"
                categories={JSON.parse(JSON.stringify(categories))}
                subCategories={JSON.parse(JSON.stringify(subCategories))}
                parents={parents}
            />
        </>
    );
};

export default Page;
