import mongoose from "mongoose";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

// /registry/find searches the public lists shoppers created, and nothing in the
// build creates one yet, so the search has nothing to find on a fresh database.
// This hangs a few public registries off the accounts that already exist, each
// filled with products from the catalog.
const REGISTRIES = [
    { name: "Our Wedding Registry", size: 8 },
    { name: "Baby Shower Registry", size: 6 },
    { name: "Housewarming Gift List", size: 6 },
    { name: "Birthday Wish List", size: 5 },
    { name: "College Dorm List", size: 7 },
];

const run = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not set");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const db = mongoose.connection.db;
    const users = await db.collection("users").find({}).project({ _id: 1, lists: 1 }).toArray();

    if (!users.length) {
        throw new Error("No users to attach registries to. Register an account first.");
    }

    const products = await db
        .collection("products")
        .find({})
        .project({ _id: 1, subProducts: 1 })
        .limit(200)
        .toArray();

    if (!products.length) {
        throw new Error("No products in the catalog. Run npm run seed first.");
    }

    const pick = (size) => {
        const shuffled = [...products].sort(() => Math.random() - 0.5).slice(0, size);

        return shuffled.map((product) => ({
            _id: new mongoose.Types.ObjectId(),
            product: product._id,
            style: String(Math.floor(Math.random() * (product.subProducts?.length || 1))),
        }));
    };

    const summary = [];

    // A registry per account, cycling through the names, so several owners can be
    // searched for. Re-running replaces the seeded lists rather than stacking them.
    for (const [index, user] of users.entries()) {
        const registry = REGISTRIES[index % REGISTRIES.length];
        const kept = (user.lists || []).filter(
            (list) => !REGISTRIES.some((entry) => entry.name === list.name)
        );

        const lists = [
            ...kept,
            {
                _id: new mongoose.Types.ObjectId(),
                name: registry.name,
                privacy: "public",
                items: pick(registry.size),
                createdAt: new Date(),
            },
        ];

        await db.collection("users").updateOne({ _id: user._id }, { $set: { lists } });

        summary.push(`${registry.name}: ${registry.size} items`);
    }

    console.log("\n--- summary ---");
    summary.forEach((line) => console.log(line));
    console.log(`public registries seeded: ${summary.length}`);

    await mongoose.disconnect();
};

run().catch(async (error) => {
    console.error(error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
