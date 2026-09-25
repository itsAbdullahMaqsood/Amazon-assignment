import mongoose from "mongoose";
import slugify from "slugify";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

// The Markaz Home storefront (/furniture) is one category ("Home & Kitchen", slug
// "furniture") whose subcategories are
// the tiles Amazon's "Shop by category" strip carries. Every product also gets a
// Room and a Style detail written onto it, so /furniture reads the "Shop by room"
// and "Shop by style" filters out of the database instead of hardcoding lists.
const ITEMS = [
    // dummyjson's furniture category.
    { title: "Annibale Colombo Bed", source: "furniture", cat: "Beds", room: "Bedroom", style: "Modern", sizes: ["Queen", "King"] },
    { title: "Annibale Colombo Sofa", source: "furniture", cat: "Sofas", room: "Living room", style: "Mid-century modern", sizes: ["2-seat", "3-seat"] },
    { title: "Bedside Table African Cherry", source: "furniture", cat: "Nightstands", room: "Bedroom", style: "Traditional", sizes: ["One size"] },
    { title: "Knoll Saarinen Executive Conference Chair", source: "furniture", cat: "Office chairs", room: "Home office", style: "Mid-century modern", sizes: ["One size"] },
    { title: "Wooden Bathroom Sink With Mirror", source: "furniture", cat: "Vanities", room: "Bathroom", style: "Farmhouse", sizes: ["24 in", "36 in"] },

    // dummyjson's home-decoration category.
    { title: "Decoration Swing", source: "home-decoration", cat: "Hammocks", room: "Outdoors", style: "Boho", sizes: ["One size"] },
    { title: "Family Tree Photo Frame", source: "home-decoration", cat: "Decorative shelving", room: "Living room", style: "Traditional", sizes: ["One size"] },
    { title: "House Showpiece Plant", source: "home-decoration", cat: "Decorative shelving", room: "Entryway", style: "Boho", sizes: ["One size"] },
    { title: "Plant Pot", source: "home-decoration", cat: "Decorative shelving", room: "Entryway", style: "Scandinavian", sizes: ["Small", "Large"] },
    { title: "Table Lamp", source: "home-decoration", cat: "Accent tables", room: "Living room", style: "Modern", sizes: ["One size"] },

    // dummyjson's kitchen-accessories category fills out the kitchen, the small
    // spaces the storefront sells to, and the rest of the style facet.
    { title: "Bamboo Spatula", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Kitchen & dining", style: "Scandinavian", sizes: ["One size"] },
    { title: "Black Aluminium Cup", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Kitchen & dining", style: "Industrial", sizes: ["8 oz", "12 oz"] },
    { title: "Black Whisk", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Kitchen & dining", style: "Industrial", sizes: ["One size"] },
    { title: "Boxed Blender", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Kitchen & dining", style: "Modern", sizes: ["One size"] },
    { title: "Carbon Steel Wok", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Kitchen & dining", style: "Industrial", sizes: ["12 in", "14 in"] },
    { title: "Chopping Board", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Small spaces", style: "Farmhouse", sizes: ["Small", "Large"] },
    { title: "Citrus Squeezer Yellow", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Kitchen & dining", style: "Modern", sizes: ["One size"] },
    { title: "Egg Slicer", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Kitchen & dining", style: "Modern", sizes: ["One size"] },
    { title: "Electric Stove", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Small spaces", style: "Industrial", sizes: ["1 burner", "2 burner"] },
    { title: "Fine Mesh Strainer", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Kitchen & dining", style: "Modern", sizes: ["One size"] },
    { title: "Fork", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Kitchen & dining", style: "Glam", sizes: ["4 piece", "8 piece"] },
    { title: "Glass", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Kitchen & dining", style: "Glam", sizes: ["4 pack", "8 pack"] },
    { title: "Grater Black", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Kitchen & dining", style: "Industrial", sizes: ["One size"] },
    { title: "Hand Blender", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Small spaces", style: "Modern", sizes: ["One size"] },
    { title: "Ice Cube Tray", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Kitchen & dining", style: "Coastal", sizes: ["2 pack"] },
    { title: "Kitchen Sieve", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Kitchen & dining", style: "Farmhouse", sizes: ["One size"] },
    { title: "Knife", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Kitchen & dining", style: "Industrial", sizes: ["6 in", "8 in"] },
    { title: "Lunch Box", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Baby & kids", style: "Coastal", sizes: ["One size"] },
    { title: "Microwave Oven", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Small spaces", style: "Modern", sizes: ["0.7 cu ft", "1.1 cu ft"] },
    { title: "Mug Tree Stand", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Small spaces", style: "Farmhouse", sizes: ["One size"] },
    { title: "Pan", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Kitchen & dining", style: "Farmhouse", sizes: ["10 in", "12 in"] },
    { title: "Plate", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Kitchen & dining", style: "Coastal", sizes: ["4 pack", "8 pack"] },
    { title: "Red Tongs", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Kitchen & dining", style: "Modern", sizes: ["One size"] },
    { title: "Silver Pot With Glass Cap", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Kitchen & dining", style: "Glam", sizes: ["3 qt", "5 qt"] },
    { title: "Slotted Turner", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Kitchen & dining", style: "Industrial", sizes: ["One size"] },
    { title: "Spice Rack", source: "kitchen-accessories", cat: "Decorative shelving", room: "Small spaces", style: "Farmhouse", sizes: ["One size"] },
    { title: "Spoon", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Kitchen & dining", style: "Glam", sizes: ["4 piece", "8 piece"] },
    { title: "Tray", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Entryway", style: "Coastal", sizes: ["One size"] },
    { title: "Wooden Rolling Pin", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Kitchen & dining", style: "Farmhouse", sizes: ["One size"] },
    { title: "Yellow Peeler", source: "kitchen-accessories", cat: "Kitchen & dining", room: "Kitchen & dining", style: "Coastal", sizes: ["One size"] },
];

const makeSlug = (value) => slugify(value, { lower: true, strict: true });
const round2 = (value) => Number(value.toFixed(2));
const randomInt = (max) => Math.floor(Math.random() * max);

const fetchSource = async (source) => {
    const res = await fetch(`https://dummyjson.com/products/category/${source}?limit=0`);

    if (!res.ok) {
        throw new Error(`dummyjson returned ${res.status} for category "${source}"`);
    }

    const { products } = await res.json();
    return products || [];
};

// Furniture is sold in one finish per listing here, so a single subProduct
// carries every image and the sizes the listing offers.
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
            // A bigger size costs more, the way a furniture listing prices one.
            price: round2(basePrice * (1 + i * 0.35)),
        })),
        discount: discountPercentage >= 5 ? discountPercentage : 0,
        sold: randomInt(500),
    };
};

const run = async () => {
    const reset = process.argv.includes("--reset");
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error("MONGODB_URI is not set. Add it to .env.local and run `npm run seed:furniture` again.");
        process.exit(1);
    }

    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    console.log(`connected to database "${db.databaseName}"`);

    const existing = await db.collection("categories").findOne({ slug: "furniture" });

    if (existing && !reset) {
        const count = await db.collection("products").countDocuments({ category: existing._id });
        console.log(`furniture category already exists with ${count} products; nothing seeded.`);
        console.log("run `npm run seed:furniture -- --reset` to wipe and reseed it.");
        await mongoose.disconnect();
        return;
    }

    if (existing) {
        const subs = await db.collection("subcategories").find({ parent: existing._id }).toArray();

        await db.collection("products").deleteMany({ category: existing._id });
        await db.collection("subcategories").deleteMany({ _id: { $in: subs.map((sub) => sub._id) } });
        await db.collection("categories").deleteOne({ _id: existing._id });
        console.log("reset: previous furniture category, subcategories and products cleared");
    }

    const sources = [...new Set(ITEMS.map((entry) => entry.source))];
    const byTitle = new Map();

    for (const source of sources) {
        for (const item of await fetchSource(source)) {
            byTitle.set(item.title, item);
        }
    }

    const categoryDoc = {
        _id: new mongoose.Types.ObjectId(),
        name: "Home & Kitchen",
        slug: "furniture",
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    await db.collection("categories").insertOne(categoryDoc);

    // One subcategory per "Shop by category" tile the catalog actually stocks.
    const subIds = new Map();

    for (const name of [...new Set(ITEMS.map((entry) => entry.cat))]) {
        const subDoc = {
            _id: new mongoose.Types.ObjectId(),
            name,
            slug: makeSlug(`furniture ${name}`),
            parent: categoryDoc._id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await db.collection("subcategories").insertOne(subDoc);
        subIds.set(name, subDoc._id);
    }

    const docs = ITEMS.map((entry) => {
        const item = byTitle.get(entry.title);

        if (!item) {
            console.warn(`dummyjson no longer carries "${entry.title}"; skipped.`);
            return null;
        }

        return {
            name: item.title,
            description: item.description,
            brand: item.brand || "Markaz Home",
            slug: makeSlug(`${item.title} furniture`),
            category: categoryDoc._id,
            subCategories: [subIds.get(entry.cat)],
            details: [
                { name: "Room", value: entry.room },
                { name: "Style", value: entry.style },
                { name: "Category", value: entry.cat },
                ...(item.dimensions
                    ? [
                          {
                              name: "Dimensions",
                              value: `${item.dimensions.width} x ${item.dimensions.depth} x ${item.dimensions.height} in`,
                          },
                      ]
                    : []),
                ...(item.warrantyInformation
                    ? [{ name: "Warranty", value: item.warrantyInformation }]
                    : []),
            ],
            questions: [],
            reviews: [],
            refundPolicy: item.returnPolicy || "30 days return policy",
            rating: 0,
            numberReviews: 0,
            shipping: 0,
            subProducts: [buildSubProduct(item, entry.sizes)],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }).filter(Boolean);

    if (docs.length) {
        await db.collection("products").insertMany(docs);
    }

    const count = (key) => {
        const tally = new Map();
        ITEMS.forEach((entry) => tally.set(entry[key], (tally.get(entry[key]) || 0) + 1));
        return [...tally].map(([name, n]) => `${name}: ${n}`).join(", ");
    };

    console.log("\n--- summary ---");
    console.log(`rooms   → ${count("room")}`);
    console.log(`styles  → ${count("style")}`);
    console.log(`total furniture products: ${docs.length}`);

    await mongoose.disconnect();
};

run().catch(async (error) => {
    console.error(error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
