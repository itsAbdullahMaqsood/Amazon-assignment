// Seeds the pharmacy catalog from openFDA drug labels (public, no API key).
//   npm run seed:meds
//   npm run seed:meds -- --reset
import mongoose from "mongoose";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const BASE = "https://api.fda.gov/drug/label.json";
const PAGES = 8;
const PER_PAGE = 100;

const first = (value) => (Array.isArray(value) ? value[0] : value) || "";

const titleCase = (value) =>
    String(value || "")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());

// openFDA carries no prices, so a stable one is derived from the label id.
const priceFor = (seed) => {
    let hash = 0;
    for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) % 100000;
    return Number((4 + (hash % 6000) / 100).toFixed(2));
};

const run = async () => {
    const reset = process.argv.includes("--reset");

    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI is not set.");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    console.log(`connected to database "${db.databaseName}"`);

    if (reset) {
        await db.collection("medications").deleteMany({});
        console.log("reset: medications cleared");
    }

    const existing = await db.collection("medications").countDocuments();

    if (existing > 0) {
        console.log(`medications collection already has ${existing} documents; nothing seeded.`);
        console.log("run `npm run seed:meds -- --reset` to wipe and reseed.");
        await mongoose.disconnect();
        return;
    }

    const byId = new Map();

    for (let page = 0; page < PAGES; page++) {
        const url = new URL(BASE);
        url.searchParams.set("search", "openfda.brand_name:*");
        url.searchParams.set("limit", String(PER_PAGE));
        url.searchParams.set("skip", String(page * PER_PAGE));

        const res = await fetch(url);

        if (!res.ok) {
            console.warn(`openFDA returned ${res.status} on page ${page + 1}; stopping early.`);
            break;
        }

        const { results = [] } = await res.json();

        for (const label of results) {
            const openfda = label.openfda || {};
            const brandName = titleCase(first(openfda.brand_name));

            if (!brandName || !label.id) {
                continue;
            }

            const price = priceFor(label.id);

            byId.set(label.id, {
                setId: label.id,
                brandName,
                genericName: titleCase(first(openfda.generic_name)),
                manufacturer: titleCase(first(openfda.manufacturer_name)),
                route: titleCase(first(openfda.route)),
                dosageForm: titleCase(first(openfda.dosage_form)),
                purpose: first(label.purpose).slice(0, 220),
                substance: titleCase(first(openfda.substance_name)),
                price,
                // Markaz Plus members see a lower cash price; Rx Saver covers cheap generics.
                primePrice: Number((price * 0.8).toFixed(2)),
                rxPassEligible: price < 20,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        console.log(`page ${page + 1}: ${results.length} labels`);
    }

    const docs = [...byId.values()];
    await db.collection("medications").insertMany(docs);

    console.log(`\ntotal medications: ${docs.length}`);
    console.log(`RxPass eligible: ${docs.filter((d) => d.rxPassEligible).length}`);

    await mongoose.disconnect();
};

run().catch(async (error) => {
    console.error(error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
