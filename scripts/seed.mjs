import mongoose from "mongoose";
import slugify from "slugify";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { spawnSync } from "child_process";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

// Builds the Markaz store from dummyjson.
//
//   npm run seed                  seed an empty catalogue (refuses if products exist)
//   npm run seed -- --reset       wipe and rebuild the whole store: the general
//                                 departments below, then groceries, furniture,
//                                 medications, movies (when TMDB_API_KEY is set)
//                                 and registries, then clean up references that
//                                 pointed at the old catalogue
//   npm run seed -- --reset --core-only   only the general departments
//
// Category slugs are stable across reseeds, so links like
// /browse?category=electronics keep working. Home & Kitchen and Grocery come
// from their own seeders, which add the room, style and aisle data their
// storefronts need.
const CATALOG = [
    {
        category: "Women's Fashion",
        slug: "women-clothing",
        subs: [
            { name: "Dresses", source: "womens-dresses", sizes: ["S", "M", "L", "XL"] },
            { name: "Tops", source: "tops", sizes: ["S", "M", "L"] },
            { name: "Bags", source: "womens-bags", sizes: ["One Size"] },
        ],
    },
    {
        category: "Men's Fashion",
        slug: "men",
        subs: [
            { name: "Shirts", source: "mens-shirts", sizes: ["S", "M", "L", "XL"] },
            { name: "Men's Watches", source: "mens-watches", sizes: ["One Size"] },
        ],
    },
    {
        category: "Shoes",
        slug: "shoes",
        subs: [
            { name: "Women's Shoes", source: "womens-shoes", sizes: ["37", "38", "39", "40"] },
            { name: "Men's Shoes", source: "mens-shoes", sizes: ["41", "42", "43", "44"] },
        ],
    },
    {
        category: "Accessories",
        slug: "accessories",
        subs: [
            { name: "Sunglasses", source: "sunglasses", sizes: ["One Size"] },
            { name: "Jewellery", source: "womens-jewellery", sizes: ["One Size"] },
            { name: "Women's Watches", source: "womens-watches", sizes: ["One Size"] },
        ],
    },
    {
        category: "Beauty",
        slug: "beauty",
        subs: [
            { name: "Makeup", source: "beauty", sizes: ["One Size"] },
            { name: "Skin Care", source: "skin-care", sizes: ["One Size"] },
            { name: "Fragrances", source: "fragrances", sizes: ["50ml", "100ml"] },
        ],
    },
    {
        category: "Electronics",
        slug: "electronics",
        subs: [
            { name: "Smartphones", source: "smartphones", sizes: ["128GB", "256GB"] },
            { name: "Laptops", source: "laptops", sizes: ["8GB RAM", "16GB RAM"] },
            { name: "Tablets", source: "tablets", sizes: ["64GB", "128GB"] },
            { name: "Phone Accessories", source: "mobile-accessories", sizes: ["One Size"] },
        ],
    },
    {
        category: "Sports & Outdoors",
        slug: "sports-outdoors",
        subs: [{ name: "Sports Gear", source: "sports-accessories", sizes: ["One Size"] }],
    },
];

// Colour variants get a swatch from this palette. lib/colors.ts names the same
// values ("Black", "Sand" ...) so the product page can say which one you picked.
const COLORS = ["#1f2328", "#f4f4f2", "#b3261e", "#2f5fa7", "#2e7d4f", "#d9c7a3", "#6b4fa0"];

// Items under this price carry a flat delivery charge; everything else ships free.
const SMALL_ORDER_PRICE = 20;
const SMALL_ORDER_SHIPPING = 4.99;

// dummyjson's reviewers all use this domain, which is how a reset finds the
// accounts it created for them.
const REVIEWER_DOMAIN = "@x.dummyjson.com";

const makeSlug = (value) => slugify(value, { lower: true, strict: true });
const round2 = (value) => Number(value.toFixed(2));

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

    const buildSizes = (variant) =>
        sizes.map((size, i) => ({
            size,
            // Split the real stock figure across the variants and sizes.
            qty: Math.max(1, Math.round((item.stock || 1) / (sizes.length * (variant + 1)))),
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
        // Deterministic, so a reseed gives each product the same swatches.
        color: { color: COLORS[(item.id + i * 3) % COLORS.length], image: "" },
        sizes: buildSizes(i),
        discount,
        sold: (item.id * 37 + i * 11) % 480,
    }));
};

const buildDetails = (item) => {
    const details = [];

    if (item.brand) details.push({ name: "Brand", value: item.brand });
    if (item.weight) details.push({ name: "Weight", value: `${item.weight} kg` });
    if (item.dimensions) {
        details.push({
            name: "Dimensions",
            value: `${item.dimensions.width} × ${item.dimensions.height} × ${item.dimensions.depth} cm`,
        });
    }
    if (item.warrantyInformation) details.push({ name: "Warranty", value: item.warrantyInformation });
    if (item.shippingInformation) details.push({ name: "Dispatch", value: item.shippingInformation });
    if (item.sku) details.push({ name: "Model", value: item.sku });

    return details;
};

const runScript = (script, args = []) => {
    console.log(`\n> node scripts/${script} ${args.join(" ")}`);
    const result = spawnSync(process.execPath, [`scripts/${script}`, ...args], { stdio: "inherit" });

    if (result.status !== 0) {
        throw new Error(`scripts/${script} failed`);
    }
};

// A reset replaces every product, so anything that pointed at the old ones
// (wishlists, lists, browsing history, carts) would render as broken rows.
// Orders keep their own copy of each line, so they are left alone.
const pruneDanglingReferences = async (db) => {
    const live = new Set((await db.collection("products").distinct("_id")).map(String));
    const users = await db.collection("users").find({}).project({ whishlist: 1, recentlyViewed: 1, lists: 1 }).toArray();
    let touched = 0;

    for (const user of users) {
        const keep = (entry) => entry?.product && live.has(String(entry.product));
        const whishlist = (user.whishlist || []).filter(keep);
        const recentlyViewed = (user.recentlyViewed || []).filter(keep);
        const lists = (user.lists || []).map((list) => ({ ...list, items: (list.items || []).filter(keep) }));

        const changed =
            whishlist.length !== (user.whishlist || []).length ||
            recentlyViewed.length !== (user.recentlyViewed || []).length ||
            lists.some((list, i) => list.items.length !== (user.lists[i].items || []).length);

        if (changed) {
            await db.collection("users").updateOne({ _id: user._id }, { $set: { whishlist, recentlyViewed, lists } });
            touched++;
        }
    }

    await db.collection("carts").deleteMany({});
    console.log(`\npruned references to removed products from ${touched} account(s); cleared saved carts`);

    // Return requests filed before the rebrand stored the old refund label.
    const relabelled = await db.collection("orders").updateMany(
        { "returnRequests.refundTo": "Amazon gift card balance" },
        { $set: { "returnRequests.$[r].refundTo": "Markaz gift card balance" } },
        { arrayFilters: [{ "r.refundTo": "Amazon gift card balance" }] }
    );
    console.log(`relabelled refund method on ${relabelled.modifiedCount} order(s)`);
};

const run = async () => {
    const reset = process.argv.includes("--reset");
    const coreOnly = process.argv.includes("--core-only");
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
        const reviewers = await db.collection("users").deleteMany({ email: { $regex: `${REVIEWER_DOMAIN.replace(".", "\\.")}$` } });
        console.log(`reset: products, categories, subcategories and coupons cleared; ${reviewers.deletedCount} seeded reviewer accounts removed`);
    }

    const existingProducts = await db.collection("products").countDocuments();

    if (existingProducts > 0) {
        console.log(`products collection already has ${existingProducts} documents; nothing seeded.`);
        console.log("run `npm run seed -- --reset` to wipe and reseed.");
        await mongoose.disconnect();
        return;
    }

    const usedSlugs = new Set();
    const reviewerIds = new Map();
    const summary = [];
    let totalProducts = 0;
    let totalReviews = 0;

    // dummyjson ships three short reviews per product with a named reviewer.
    // Each reviewer becomes a passwordless account (it can never sign in), so
    // the reviews hang off real users the way the review model expects.
    const reviewerFor = async (review) => {
        const email = String(review.reviewerEmail || "").toLowerCase();

        if (!email) return null;
        if (reviewerIds.has(email)) return reviewerIds.get(email);

        const _id = new mongoose.Types.ObjectId();
        await db.collection("users").insertOne({
            _id,
            name: review.reviewerName || "Markaz customer",
            email,
            role: "user",
            image: "https://i.im.ge/2023/04/25/Lg2cWX.user-image-default.jpg",
            emailVerified: false,
            defaultPaymentMethod: "",
            address: [],
            whishlist: [],
            createdAt: new Date(review.date || Date.now()),
            updatedAt: new Date(),
        });
        reviewerIds.set(email, _id);

        return _id;
    };

    for (const entry of CATALOG) {
        const categoryDoc = {
            _id: new mongoose.Types.ObjectId(),
            name: entry.category,
            slug: entry.slug,
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

            // dummyjson carries a couple of Amazon-branded devices; a store that
            // is not Amazon does not sell them.
            const items = (await fetchCategory(sub.source)).filter(
                (item) => !/amazon|alexa/i.test(`${item.brand || ""} ${item.title || ""}`)
            );
            const docs = [];

            for (const item of items) {
                let slug = makeSlug(item.title);

                if (usedSlugs.has(slug)) {
                    slug = `${slug}-${item.id}`;
                }
                usedSlugs.add(slug);

                const subProducts = buildSubProducts(item, sub.sizes);
                const reviews = [];

                for (const review of item.reviews || []) {
                    const reviewBy = await reviewerFor(review);

                    if (!reviewBy || !review.comment) continue;

                    const at = new Date(review.date || Date.now());
                    reviews.push({
                        _id: new mongoose.Types.ObjectId(),
                        reviewBy,
                        rating: Math.min(5, Math.max(1, Number(review.rating) || 5)),
                        review: review.comment,
                        size: sub.sizes[0],
                        style: { color: subProducts[0].color.color, image: "" },
                        fit: "",
                        images: [],
                        likes: [],
                        verified: false,
                        createdAt: at,
                        updatedAt: at,
                    });
                }

                const rating = reviews.length
                    ? round2(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length)
                    : 0;

                totalReviews += reviews.length;

                docs.push({
                    name: item.title,
                    description: item.description,
                    brand: item.brand || "",
                    slug,
                    category: categoryDoc._id,
                    subCategories: [subDoc._id],
                    details: buildDetails(item),
                    questions: [],
                    reviews,
                    refundPolicy:
                        item.returnPolicy && !/^no return/i.test(item.returnPolicy)
                            ? item.returnPolicy.replace(/ return policy$/i, "")
                            : "No returns",
                    rating,
                    numberReviews: reviews.length,
                    shipping: item.price < SMALL_ORDER_PRICE ? SMALL_ORDER_SHIPPING : 0,
                    subProducts,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }

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

    await db.collection("coupons").insertMany([
        {
            coupon: "WELCOME10",
            startDate: today.toISOString().slice(0, 10),
            endDate: nextYear.toISOString().slice(0, 10),
            discount: 10,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            coupon: "MARKAZ15",
            startDate: today.toISOString().slice(0, 10),
            endDate: nextYear.toISOString().slice(0, 10),
            discount: 15,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);
    console.log("seeded coupons WELCOME10 (10%) and MARKAZ15 (15%)");

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
    console.log(`total products: ${totalProducts}, reviews: ${totalReviews}, reviewer accounts: ${reviewerIds.size}`);

    await mongoose.disconnect();

    if (reset && !coreOnly) {
        runScript("seed-grocery.mjs", ["--reset"]);
        runScript("seed-furniture.mjs", ["--reset"]);
        runScript("seed-medications.mjs", ["--reset"]);

        if (process.env.TMDB_API_KEY) {
            runScript("seed-videos.mjs", ["--reset"]);
        } else {
            console.log("\nTMDB_API_KEY is not set: Markaz Movies keeps its current catalogue.");
        }

        runScript("seed-registries.mjs");

        await mongoose.connect(uri);
        await pruneDanglingReferences(mongoose.connection.db);
        await mongoose.disconnect();
    }
};

run().catch(async (error) => {
    console.error(error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
