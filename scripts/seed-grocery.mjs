import mongoose from "mongoose";
import slugify from "slugify";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

// The Grocery storefront is one category ("Grocery") whose subcategories are the
// aisles. Each aisle declares the department it hangs under; the department is
// written onto every product as a detail, so /groceries reads its whole nav out
// of the database instead of hardcoding it.
const AISLES = [
    { department: "Produce", aisle: "Fruits", sizes: ["Each", "3 lb bag"], items: ["Apple", "Kiwi"] },
    { department: "Produce", aisle: "Berries", sizes: ["6 oz", "1 lb"], items: ["Strawberry", "Mulberry"] },
    { department: "Produce", aisle: "Citrus", sizes: ["Each", "2 lb bag"], items: ["Lemon"] },
    { department: "Produce", aisle: "Onions", sizes: ["Each", "3 lb bag"], items: ["Red Onions"] },
    {
        department: "Produce",
        aisle: "Vegetables",
        sizes: ["Each", "2 lb"],
        items: ["Cucumber", "Potatoes", "Green Bell Pepper", "Green Chili Pepper"],
    },
    { department: "Dairy & Eggs", aisle: "Milk & Cream", sizes: ["1 qt", "1 gal"], items: ["Milk"] },
    { department: "Dairy & Eggs", aisle: "Eggs", sizes: ["12 count", "18 count"], items: ["Eggs"] },
    { department: "Meat & Seafood", aisle: "Meat", sizes: ["1 lb", "2 lb"], items: ["Beef Steak", "Chicken Meat"] },
    { department: "Meat & Seafood", aisle: "Seafood", sizes: ["1 lb", "2 lb"], items: ["Fish Steak"] },
    { department: "Frozen", aisle: "Frozen Desserts", sizes: ["1 pint", "1 qt"], items: ["Ice Cream"] },
    { department: "Beverages", aisle: "Coffee", sizes: ["7 oz", "14 oz"], items: ["Nescafe Coffee"] },
    { department: "Beverages", aisle: "Juice", sizes: ["1 qt", "1 gal"], items: ["Juice"] },
    { department: "Beverages", aisle: "Water", sizes: ["12 pack", "24 pack"], items: ["Water"] },
    { department: "Beverages", aisle: "Soft Drinks", sizes: ["6 pack", "12 pack"], items: ["Soft Drinks"] },
    { department: "Pantry", aisle: "Cooking Essentials", sizes: ["16 oz", "32 oz"], items: ["Cooking Oil"] },
    { department: "Pantry", aisle: "Grains & Rice", sizes: ["2 lb", "5 lb"], items: ["Rice"] },
    { department: "Pantry", aisle: "Condiments", sizes: ["12 oz", "24 oz"], items: ["Honey Jar"] },
    { department: "Pantry", aisle: "Health & Wellness", sizes: ["1 lb", "2 lb"], items: ["Protein Powder"] },
    { department: "Household", aisle: "Household Essentials", sizes: ["1 box", "6 pack"], items: ["Tissue Paper Box"] },
    { department: "Household", aisle: "Pet Supplies", sizes: ["2 lb", "7 lb"], items: ["Cat Food", "Dog Food"] },
];

const makeSlug = (value) => slugify(value, { lower: true, strict: true });
const round2 = (value) => Number(value.toFixed(2));
const randomInt = (max) => Math.floor(Math.random() * max);

const fetchGroceries = async () => {
    const res = await fetch("https://dummyjson.com/products/category/groceries?limit=0");

    if (!res.ok) {
        throw new Error(`dummyjson returned ${res.status} for category "groceries"`);
    }

    const { products } = await res.json();
    return products || [];
};

// Groceries have no colour variants, so one subProduct carries every image and
// the pack sizes the aisle sells.
const buildSubProduct = (item, sizes) => {
    const images = (item.images?.length ? item.images : [item.thumbnail]).filter(Boolean);
    const basePrice = item.price || 1;
    const discountPercentage = Math.round(item.discountPercentage || 0);

    return {
        sku: `${makeSlug(item.title)}-${item.id}`,
        images: images.map((url) => ({ url, public_url: url })),
        description_images: [],
        color: { color: "", image: "" },
        sizes: sizes.map((size, i) => ({
            size,
            qty: Math.max(1, item.stock || 1) + i,
            // Bigger packs cost more per unit line, the way a store prices them.
            price: round2(basePrice * (1 + i * 0.85)),
        })),
        discount: discountPercentage >= 5 ? discountPercentage : 0,
        sold: randomInt(500),
    };
};

const run = async () => {
    const reset = process.argv.includes("--reset");
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error("MONGODB_URI is not set. Add it to .env.local and run `npm run seed:grocery` again.");
        process.exit(1);
    }

    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    console.log(`connected to database "${db.databaseName}"`);

    const existing = await db.collection("categories").findOne({ slug: "grocery" });

    if (existing && !reset) {
        const count = await db.collection("products").countDocuments({ category: existing._id });
        console.log(`grocery category already exists with ${count} products; nothing seeded.`);
        console.log("run `npm run seed:grocery -- --reset` to wipe and reseed it.");
        await mongoose.disconnect();
        return;
    }

    if (existing) {
        const subs = await db.collection("subcategories").find({ parent: existing._id }).toArray();

        await db.collection("products").deleteMany({ category: existing._id });
        await db.collection("subcategories").deleteMany({ _id: { $in: subs.map((sub) => sub._id) } });
        await db.collection("categories").deleteOne({ _id: existing._id });
        console.log("reset: previous grocery category, aisles and products cleared");
    }

    const items = await fetchGroceries();
    const byTitle = new Map(items.map((item) => [item.title, item]));

    const categoryDoc = {
        _id: new mongoose.Types.ObjectId(),
        name: "Grocery",
        slug: "grocery",
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    await db.collection("categories").insertOne(categoryDoc);

    const summary = [];
    let totalProducts = 0;

    for (const entry of AISLES) {
        const subDoc = {
            _id: new mongoose.Types.ObjectId(),
            name: entry.aisle,
            slug: makeSlug(`grocery ${entry.aisle}`),
            parent: categoryDoc._id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await db.collection("subcategories").insertOne(subDoc);

        const docs = entry.items
            .map((title) => {
                const item = byTitle.get(title);

                if (!item) {
                    console.warn(`dummyjson no longer carries "${title}"; skipped.`);
                    return null;
                }

                return {
                    name: item.title,
                    description: item.description,
                    brand: item.brand || "Markaz Pantry",
                    slug: makeSlug(`${item.title} grocery`),
                    category: categoryDoc._id,
                    subCategories: [subDoc._id],
                    details: [
                        { name: "Department", value: entry.department },
                        { name: "Aisle", value: entry.aisle },
                        ...(item.shippingInformation ? [{ name: "Dispatch", value: item.shippingInformation }] : []),
                    ],
                    questions: [],
                    reviews: [],
                    refundPolicy: item.returnPolicy || "No returns on fresh grocery",
                    rating: 0,
                    numberReviews: 0,
                    shipping: 0,
                    subProducts: [buildSubProduct(item, entry.sizes)],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            })
            .filter(Boolean);

        if (docs.length) {
            await db.collection("products").insertMany(docs);
        }

        totalProducts += docs.length;
        summary.push(`${entry.department} / ${entry.aisle}: ${docs.length}`);
    }

    console.log("\n--- summary ---");
    summary.forEach((line) => console.log(line));
    console.log(`total grocery products: ${totalProducts}`);

    await mongoose.disconnect();
};

run().catch(async (error) => {
    console.error(error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
