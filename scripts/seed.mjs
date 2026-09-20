import mongoose from "mongoose";
import slugify from "slugify";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const CATALOG = [
    {
        category: "women clothing",
        subs: [
            { name: "Dresses", source: "womens-dresses", sizes: ["S", "M", "L", "XL"] },
            { name: "Tops", source: "tops", sizes: ["S", "M", "L"] },
            { name: "Bags", source: "womens-bags", sizes: ["One Size"] },
        ],
    },
    {
        category: "shoes",
        subs: [
            { name: "Women Shoes", source: "womens-shoes", sizes: ["37", "38", "39", "40"] },
            { name: "Men Shoes", source: "mens-shoes", sizes: ["41", "42", "43", "44"] },
        ],
    },
    {
        category: "Beauty",
        subs: [
            { name: "Makeup", source: "beauty", sizes: ["One Size"] },
            { name: "Skin Care", source: "skin-care", sizes: ["One Size"] },
            { name: "Fragrances", source: "fragrances", sizes: ["50ml", "100ml"] },
        ],
    },
    {
        category: "Kids",
        subs: [{ name: "Toys & Sports", source: "sports-accessories", sizes: ["One Size"] }],
    },
    {
        category: "Men",
        subs: [
            { name: "Shirts", source: "mens-shirts", sizes: ["S", "M", "L", "XL"] },
            { name: "Watches", source: "mens-watches", sizes: ["One Size"] },
        ],
    },
    {
        category: "Electronics",
        subs: [
            { name: "Smartphones", source: "smartphones", sizes: ["128GB", "256GB"] },
            { name: "Laptops", source: "laptops", sizes: ["8GB RAM", "16GB RAM"] },
        ],
    },
];

const COLORS = ["#000000", "#ffffff", "#c0392b", "#2980b9", "#27ae60", "#ecd297", "#8e44ad"];

const makeSlug = (value) => slugify(value, { lower: true, strict: true });
const round2 = (value) => Number(value.toFixed(2));
const randomInt = (max) => Math.floor(Math.random() * max);

const fetchCategory = async (source) => {
    const res = await fetch(`https://dummyjson.com/products/category/${source}?limit=0`);

    if (!res.ok) {
        throw new Error(`dummyjson returned ${res.status} for category "${source}"`);
    }

    const { products } = await res.json();
    return products || [];
};

const buildSubProducts = (item, sizes) => {
    const images = (item.images?.length ? item.images : [item.thumbnail]).filter(Boolean);
    const basePrice = item.price || 1;

    const buildSizes = () =>
        sizes.map((size, i) => ({
            size,
            qty: Math.max(1, item.stock || 1) + i,
            price: round2(basePrice * (1 + i * 0.1)),
        }));

    const discountPercentage = Math.round(item.discountPercentage || 0);
    const discount = discountPercentage >= 5 ? discountPercentage : 0;

    const variantImages =
        images.length >= 2
            ? [images.slice(0, Math.ceil(images.length / 2)), images.slice(Math.ceil(images.length / 2))]
            : [images];

    return variantImages.map((group, i) => ({
        sku: `${makeSlug(item.title)}-${item.id}-${i}`,
        images: group.map((url) => ({ url, public_url: url })),
        description_images: [],
        color: { color: COLORS[randomInt(COLORS.length)], image: "" },
        sizes: buildSizes(),
        discount,
        sold: randomInt(500),
    }));
};

const buildDetails = (item) => {
    const details = [];

    if (item.brand) details.push({ name: "Brand", value: item.brand });
    if (item.weight) details.push({ name: "Weight", value: `${item.weight}` });
    if (item.dimensions) {
        details.push({
            name: "Dimensions",
            value: `${item.dimensions.width} x ${item.dimensions.height} x ${item.dimensions.depth}`,
        });
    }
    if (item.warrantyInformation) details.push({ name: "Warranty", value: item.warrantyInformation });

    return details;
};

const run = async () => {
    const reset = process.argv.includes("--reset");
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error("MONGODB_URI is not set. Add it to .env.local and run `npm run seed` again.");
        process.exit(1);
    }

    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    console.log(`connected to database "${db.databaseName}"`);

    if (reset) {
        for (const name of ["products", "categories", "subcategories", "coupons"]) {
            await db.collection(name).deleteMany({});
        }
        console.log("reset: products, categories, subcategories and coupons cleared");
    }

    const existingProducts = await db.collection("products").countDocuments();

    if (existingProducts > 0) {
        console.log(`products collection already has ${existingProducts} documents; nothing seeded.`);
        console.log("run `npm run seed -- --reset` to wipe and reseed.");
        await mongoose.disconnect();
        return;
    }

    const usedSlugs = new Set();
    const summary = [];
    let totalProducts = 0;

    for (const entry of CATALOG) {
        const categorySlug = makeSlug(entry.category);
        const categoryDoc = {
            _id: new mongoose.Types.ObjectId(),
            name: entry.category,
            slug: categorySlug,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await db.collection("categories").insertOne(categoryDoc);

        for (const sub of entry.subs) {
            const subDoc = {
                _id: new mongoose.Types.ObjectId(),
                name: sub.name,
                slug: makeSlug(sub.source),
                parent: categoryDoc._id,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await db.collection("subcategories").insertOne(subDoc);

            const items = await fetchCategory(sub.source);
            const docs = items.map((item) => {
                let slug = makeSlug(item.title);

                if (usedSlugs.has(slug)) {
                    slug = `${slug}-${item.id}`;
                }
                usedSlugs.add(slug);

                return {
                    name: item.title,
                    description: item.description,
                    brand: item.brand || "",
                    slug,
                    category: categoryDoc._id,
                    subCategories: [subDoc._id],
                    details: buildDetails(item),
                    questions: [],
                    reviews: [],
                    refundPolicy: item.returnPolicy || "30 days",
                    rating: 0,
                    numberReviews: 0,
                    shipping: 0,
                    subProducts: buildSubProducts(item, sub.sizes),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            });

            if (docs.length) {
                await db.collection("products").insertMany(docs);
            }

            totalProducts += docs.length;
            summary.push(`${entry.category} / ${sub.name} (${sub.source}): ${docs.length}`);
            console.log(`seeded ${docs.length} products into ${entry.category} / ${sub.name}`);
        }
    }

    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);

    await db.collection("coupons").insertOne({
        coupon: "WELCOME10",
        startDate: today.toISOString().slice(0, 10),
        endDate: nextYear.toISOString().slice(0, 10),
        discount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    console.log("seeded coupon WELCOME10 (10%)");

    const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
    const existingAdmin = await db.collection("users").findOne({ email: adminEmail });

    if (existingAdmin) {
        console.log(`admin user ${adminEmail} already exists; skipped.`);
    } else {
        const generated = !process.env.SEED_ADMIN_PASSWORD;
        const adminPassword = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(18).toString("base64url");

        await db.collection("users").insertOne({
            name: "Admin",
            email: adminEmail,
            password: await bcrypt.hash(adminPassword, 12),
            role: "admin",
            image: "https://i.im.ge/2023/04/25/Lg2cWX.user-image-default.jpg",
            emailVerified: true,
            defaultPaymentMethod: "",
            address: [],
            whishlist: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        console.log(`admin user created: ${adminEmail}`);
        if (generated) {
            console.log(`admin password (generated, shown once): ${adminPassword}`);
        }
    }

    console.log("\n--- summary ---");
    summary.forEach((line) => console.log(line));
    console.log(`total products: ${totalProducts}`);

    await mongoose.disconnect();
};

run().catch(async (error) => {
    console.error(error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
