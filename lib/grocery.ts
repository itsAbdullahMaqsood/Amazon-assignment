import connectDb from "@/lib/db";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Product from "@/models/Product";
import { toCardProduct } from "@/lib/recommendations";

// Amazon's own aisle order on the grocery storefront. Departments the catalog
// does not carry are simply absent; anything seeded outside this list lands
// after it, alphabetically.
const DEPARTMENT_ORDER = [
    "Produce",
    "Dairy & Eggs",
    "Meat & Seafood",
    "Breads & Bakery",
    "Frozen",
    "Deli & Prepared",
    "Beverages",
    "Snacks",
    "Pantry",
    "Breakfast Foods",
    "Household",
];

export const grocerySlug = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

const detail = (product: any, name: string) =>
    (product.details || []).find((entry: any) => entry.name === name)?.value || "";

const rank = (name: string) => {
    const index = DEPARTMENT_ORDER.indexOf(name);
    return index === -1 ? DEPARTMENT_ORDER.length : index;
};

// The whole storefront in one read: the department strip, the aisles under each
// department and the products in each aisle, all shaped for the cards.
export const getGroceryStorefront = async () => {
    await connectDb();

    const category: any = await Category.findOne({ slug: "grocery" }).lean();

    if (!category) {
        return null;
    }

    const [subCategories, products] = await Promise.all([
        SubCategory.find({ parent: category._id }).lean(),
        Product.find({ category: category._id }).sort({ "subProducts.sold": -1 }).lean(),
    ]);

    const aisleNames = new Map(
        subCategories.map((sub: any) => [String(sub._id), sub.name as string])
    );

    const cards = products.map((product: any) => {
        const sizes = product.subProducts?.[0]?.sizes || [];

        return {
            ...toCardProduct(product),
            // The pack the price belongs to, e.g. "3 lb bag".
            unit: sizes[0]?.size || "",
            department: detail(product, "Department"),
            aisle: aisleNames.get(String(product.subCategories?.[0])) || detail(product, "Aisle"),
        };
    });

    const departments: any[] = [];

    for (const card of cards) {
        if (!card.department) {
            continue;
        }

        let department = departments.find((entry) => entry.name === card.department);

        if (!department) {
            department = {
                name: card.department,
                slug: grocerySlug(card.department),
                image: "",
                aisles: [],
                products: [],
            };
            departments.push(department);
        }

        let aisle = department.aisles.find((entry: any) => entry.name === card.aisle);

        if (!aisle) {
            aisle = { name: card.aisle, slug: grocerySlug(card.aisle), image: "", products: [] };
            department.aisles.push(aisle);
        }

        department.products.push(card);
        aisle.products.push(card);

        // The first product that has one illustrates the department and its aisle.
        department.image = department.image || card.image;
        aisle.image = aisle.image || card.image;
    }

    departments.sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name));

    // Biggest aisle first, so a department opens on the shelf it mostly sells.
    departments.forEach((department) =>
        department.aisles.sort(
            (a: any, b: any) =>
                b.products.length - a.products.length || a.name.localeCompare(b.name)
        )
    );

    const deals = cards
        .filter((card: any) => card.discount > 0)
        .sort((a: any, b: any) => b.discount - a.discount);

    return {
        categoryId: String(category._id),
        departments,
        deals,
        total: cards.length,
    };
};
