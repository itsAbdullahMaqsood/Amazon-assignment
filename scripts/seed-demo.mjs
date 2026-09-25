import mongoose from "mongoose";
import bcrypt from "bcrypt";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

// Fills ONE account with the history a demo needs: orders across every status,
// reviews, a wishlist, browsing history, saved addresses and a gift-card
// balance. A fresh account shows empty states everywhere, which is exactly what
// a walkthrough should not open on.
//
//   npm run seed:demo -- --email=you@example.com
//   npm run seed:demo -- --email=you@example.com --password=secret123   (creates the account if missing)
//   npm run seed:demo -- --email=you@example.com --remove               (takes the demo data back out)
//
// Safe to run repeatedly: each run replaces what the previous run wrote instead
// of stacking duplicates. It only ever ADDS to the account — existing addresses,
// wishlist items, browsing history, orders and hand-written reviews are kept.
// Nothing outside the named account is touched.

const arg = (name) => {
    const hit = process.argv.find((entry) => entry.startsWith(`--${name}=`));

    return hit ? hit.split("=").slice(1).join("=") : "";
};

const DEMO_TAG = "demo-seed";
const DEMO_CODE = "MRKZ-0050-5950";
const REMOVE = process.argv.includes("--remove");

const ADDRESSES = [
    {
        firstName: "Abdullah",
        lastName: "Maqsood",
        phoneNumber: "+92 300 1234567",
        address1: "House 12, Street 4",
        address2: "Gulberg III",
        city: "Lahore",
        zipCode: "54660",
        state: "Punjab",
        country: "Pakistan",
        active: true,
    },
    {
        firstName: "Abdullah",
        lastName: "Maqsood",
        phoneNumber: "+92 321 7654321",
        address1: "Office 8, Plot 22",
        address2: "Blue Area",
        city: "Islamabad",
        zipCode: "44000",
        state: "Islamabad Capital Territory",
        country: "Pakistan",
        active: false,
    },
];

const REVIEWS = [
    {
        rating: 5,
        review: "Exactly what the listing described. Arrived two days early and the stitching is far better than I expected at this price.",
        fit: "True to size",
    },
    {
        rating: 4,
        review: "Good quality and it looks like the photos. Knocking one star off because the colour is a shade darker in daylight.",
        fit: "True to size",
    },
    {
        rating: 5,
        review: "Second one I have bought. The first has been through a year of washing and still looks new, so I bought a spare.",
        fit: "Small",
    },
];

const RETURN_REASON = "Item defective or doesn't work";

const round2 = (value) => Number(Number(value).toFixed(2));
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

// A cart line the way /api/user/savecart builds one: the price comes off the
// product document, never from anywhere else.
const lineFrom = (product, styleIndex = 0, sizeIndex = 0, qty = 1) => {
    const subProduct = product.subProducts[styleIndex] || product.subProducts[0];
    const row = subProduct.sizes[sizeIndex] || subProduct.sizes[0];
    const discount = subProduct.discount || 0;
    const price = round2(discount ? row.price - (row.price * discount) / 100 : row.price);

    return {
        product: product._id,
        name: product.name,
        image: subProduct.images?.[0]?.url || "",
        size: row.size,
        qty,
        color: { color: subProduct.color?.color || "", image: subProduct.color?.image || "" },
        price,
    };
};

const orderFrom = (userId, address, lines, overrides) => {
    const total = round2(lines.reduce((sum, line) => sum + line.price * line.qty, 0));

    return {
        user: userId,
        products: lines,
        shippingAddress: { ...address, active: undefined },
        paymentMethod: "paypal",
        total,
        totalBeforeDiscount: total,
        couponApplied: "",
        giftCardApplied: 0,
        shippingPrice: 0,
        taxPrice: 0,
        isPaid: false,
        status: "Not Processed",
        returnRequests: [],
        // Marks the rows this script owns, so a re-run or --remove can take them
        // back out without touching orders placed by hand during a demo.
        seededBy: DEMO_TAG,
        ...overrides,
    };
};

const run = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not set");
    }

    const email = (arg("email") || "").trim().toLowerCase();

    if (!email) {
        throw new Error("Pass the account to fill: npm run seed:demo -- --email=you@example.com");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const db = mongoose.connection.db;
    const users = db.collection("users");
    const videos = db.collection("videos");
    const orders = db.collection("orders");
    const products = db.collection("products");

    let user = await users.findOne({ email });

    if (!user) {
        const password = arg("password");

        if (!password) {
            throw new Error(
                `No account for ${email}. Register it in the app, or pass --password=... to create it here.`
            );
        }

        const inserted = await users.insertOne({
            name: arg("name") || "Abdullah Maqsood",
            email,
            password: await bcrypt.hash(password, 12),
            role: "user",
            emailVerified: true,
            image: "https://i.im.ge/2023/04/25/Lg2cWX.user-image-default.jpg",
            defaultPaymentMethod: "paypal",
            giftCardBalance: 0,
            giftCardHistory: [],
            address: [],
            recentlyViewed: [],
            watchlist: [],
            library: [],
            lists: [],
            whishlist: [],
            createdAt: daysAgo(400),
            updatedAt: new Date(),
        });

        user = await users.findOne({ _id: inserted.insertedId });
        console.log(`created account ${email}`);
    }

    // Replace, don't stack: only rows this script tagged are taken back out.
    const removed = await orders.deleteMany({ user: user._id, seededBy: DEMO_TAG });
    const taggedReview = { reviewBy: user._id, seededBy: DEMO_TAG };
    const touched = await products
        .find({ reviews: { $elemMatch: taggedReview } })
        .project({ _id: 1 })
        .toArray();
    const cleaned = await products.updateMany(
        { reviews: { $elemMatch: taggedReview } },
        { $pull: { reviews: taggedReview } }
    );

    // Pulling a review has to move the product's average and count with it.
    for (const { _id } of touched) {
        const product = await products.findOne({ _id }, { projection: { reviews: 1 } });
        const left = product.reviews || [];
        const total = left.reduce((sum, entry) => sum + Number(entry.rating || 0), 0);

        await products.updateOne(
            { _id },
            {
                $set: {
                    rating: left.length ? Number((total / left.length).toFixed(1)) : 0,
                    numberReviews: left.length,
                },
            }
        );
    }

    if (REMOVE) {
        const pulled = await users.updateOne(
            { _id: user._id },
            {
                $pull: {
                    address: { seededBy: DEMO_TAG },
                    whishlist: { seededBy: DEMO_TAG },
                    lists: { seededBy: DEMO_TAG },
                    recentlyViewed: { seededBy: DEMO_TAG },
                    giftCardHistory: { seededBy: DEMO_TAG },
                    watchlist: { seededBy: DEMO_TAG },
                    library: { seededBy: DEMO_TAG },
                },
            }
        );
        const ledger = (user.giftCardHistory || []).filter((entry) => entry.seededBy === DEMO_TAG);
        const net = ledger.reduce(
            (sum, entry) => sum + (entry.type === "used" ? -entry.amount : entry.amount),
            0
        );

        if (net) {
            await users.updateOne(
                { _id: user._id },
                { $set: { giftCardBalance: round2(Math.max(0, (user.giftCardBalance || 0) - net)) } }
            );
        }

        console.log(
            `removed demo data for ${email}: ${removed.deletedCount} orders, reviews on ${cleaned.modifiedCount} products, account fields ${pulled.modifiedCount ? "cleaned" : "already clean"}`
        );
        await mongoose.disconnect();
        return;
    }

    if (removed.deletedCount || cleaned.modifiedCount) {
        console.log(
            `replaced the previous run: ${removed.deletedCount} orders, reviews on ${cleaned.modifiedCount} products`
        );
    }

    const catalogue = await products
        .find({ "subProducts.0.sizes.0": { $exists: true } })
        .project({ name: 1, slug: 1, subProducts: 1, rating: 1, numberReviews: 1 })
        .limit(120)
        .toArray();

    if (catalogue.length < 12) {
        throw new Error("Not enough products in the catalogue. Run npm run seed first.");
    }

    const pick = (index) => catalogue[index % catalogue.length];

    // A couple of groceries among the orders, so the Restock row on /groceries
    // has something real behind it.
    const groceryCategory = await db.collection("categories").findOne({ slug: "grocery" });
    const groceries = groceryCategory
        ? await products
              .find({ category: groceryCategory._id, "subProducts.0.sizes.0": { $exists: true } })
              .project({ name: 1, slug: 1, subProducts: 1 })
              .limit(3)
              .toArray()
        : [];

    // --- Orders: one per status, so every tab and filter has something in it.
    const [home, work] = ADDRESSES;

    const delivered = orderFrom(
        user._id,
        home,
        [lineFrom(pick(0), 0, 0, 1), lineFrom(pick(1), 0, 0, 2), ...groceries.map((item) => lineFrom(item, 0, 0, 1))],
        {
            isPaid: true,
            paidAt: daysAgo(24),
            deliveredAt: daysAgo(19),
            status: "Completed",
            createdAt: daysAgo(25),
            updatedAt: daysAgo(19),
        }
    );

    // Delivered long enough ago to be outside the 30-day window, and carrying a
    // finished return so the Return status tab shows more than one state.
    const older = orderFrom(user._id, home, [lineFrom(pick(2), 0, 0, 1)], {
        isPaid: true,
        paidAt: daysAgo(96),
        deliveredAt: daysAgo(90),
        status: "Completed",
        createdAt: daysAgo(97),
        updatedAt: daysAgo(60),
    });

    older.returnRequests = [
        {
            line: 0,
            name: older.products[0].name,
            image: older.products[0].image,
            qty: 1,
            reason: RETURN_REASON,
            comments: "The zip split on the second wear.",
            refundTo: "Original payment method",
            status: "Refunded",
            requestedAt: daysAgo(86),
        },
    ];

    const dispatched = orderFrom(user._id, work, [lineFrom(pick(3), 0, 0, 1)], {
        isPaid: true,
        paidAt: daysAgo(4),
        status: "Dispatched",
        createdAt: daysAgo(5),
        updatedAt: daysAgo(4),
    });

    const processing = orderFrom(
        user._id,
        home,
        [lineFrom(pick(4), 0, 0, 1), lineFrom(pick(5), 0, 0, 1)],
        {
            isPaid: true,
            paidAt: daysAgo(1),
            status: "Processing",
            createdAt: daysAgo(1),
            updatedAt: daysAgo(1),
        }
    );

    // Paid with a coupon and part of a gift-card balance, so the order total
    // panel shows every line it can.
    const discounted = orderFrom(user._id, home, [lineFrom(pick(6), 0, 0, 1)], {
        isPaid: true,
        paidAt: daysAgo(11),
        deliveredAt: daysAgo(7),
        status: "Completed",
        couponApplied: "WELCOME10",
        createdAt: daysAgo(12),
        updatedAt: daysAgo(7),
    });

    discounted.totalBeforeDiscount = discounted.total;
    discounted.total = round2(discounted.total * 0.9 - 5);
    discounted.giftCardApplied = 5;

    const cancelled = orderFrom(user._id, work, [lineFrom(pick(7), 0, 0, 1)], {
        isPaid: false,
        status: "Cancelled",
        createdAt: daysAgo(40),
        updatedAt: daysAgo(39),
    });

    const written = [delivered, older, dispatched, processing, discounted, cancelled];

    await orders.insertMany(written);

    // --- Reviews, on products this account has actually paid for, so the
    // Verified Purchase badge is earned rather than faked.
    const reviewed = [pick(0), pick(1), pick(2)];

    for (let i = 0; i < reviewed.length; i++) {
        const product = reviewed[i];
        const subProduct = product.subProducts[0];
        const template = REVIEWS[i % REVIEWS.length];

        const fresh = await products.findOne({ _id: product._id }, { projection: { reviews: 1 } });
        const own = (fresh.reviews || []).find(
            (entry) => String(entry.reviewBy) === String(user._id)
        );

        // A review this account wrote in the app is kept as it is.
        if (own) {
            continue;
        }

        const others = fresh.reviews || [];

        const next = [
            ...others,
            {
                _id: new mongoose.Types.ObjectId(),
                reviewBy: user._id,
                rating: template.rating,
                review: template.review,
                size: subProduct.sizes[0].size,
                style: { color: subProduct.color?.color || "", image: subProduct.color?.image || "" },
                fit: template.fit,
                verified: true,
                likes: [],
                seededBy: DEMO_TAG,
                createdAt: daysAgo(14 - i * 3),
                updatedAt: daysAgo(14 - i * 3),
            },
        ];

        const average = next.reduce((sum, entry) => sum + Number(entry.rating || 0), 0) / next.length;

        await products.updateOne(
            { _id: product._id },
            {
                $set: {
                    reviews: next,
                    rating: Number(average.toFixed(1)),
                    numberReviews: next.length,
                },
            }
        );
    }

    // --- Account state: added alongside what the account already has, and
    // tagged so the next run (or --remove) finds exactly these entries.
    const fresh = await users.findOne({ _id: user._id });
    const strip = (list) => (list || []).filter((entry) => entry.seededBy !== DEMO_TAG);

    const keptAddresses = strip(fresh.address);
    const hasDefault = keptAddresses.some((entry) => entry.active);
    const addresses = [
        ...keptAddresses,
        ...ADDRESSES.filter(
            (demo) => !keptAddresses.some((entry) => entry.address1 === demo.address1)
        ).map((demo, index) => ({
            ...demo,
            _id: new mongoose.Types.ObjectId(),
            // Only becomes the default when the account has none of its own.
            active: !hasDefault && index === 0,
            seededBy: DEMO_TAG,
        })),
    ];

    const keptWishlist = strip(fresh.whishlist);
    const wishlist = [
        ...keptWishlist,
        ...[8, 9, 10, 11, 12]
            .map((index) => pick(index)._id)
            .filter((id) => !keptWishlist.some((entry) => String(entry.product) === String(id)))
            .map((id) => ({ _id: new mongoose.Types.ObjectId(), product: id, style: "0", seededBy: DEMO_TAG })),
    ];

    // A Plus membership a few days into its trial, and one repeat, so the
    // membership page and the delivery waiver can both be seen.
    const membership = fresh.membership?.startedAt
        ? fresh.membership
        : {
              plan: "annual",
              status: "trial",
              startedAt: daysAgo(4),
              trialEndsAt: new Date(daysAgo(4).getTime() + 30 * 24 * 60 * 60 * 1000),
              renewsAt: new Date(daysAgo(4).getTime() + 30 * 24 * 60 * 60 * 1000),
          };

    // Two named lists, one shared by link and one public so it can be found by
    // name on /registry, each with products from the catalogue.
    const keptLists = strip(fresh.lists);
    const listItems = (indexes) =>
        indexes.map((index, i) => ({
            _id: new mongoose.Types.ObjectId(),
            product: pick(index)._id,
            style: "0",
            addedAt: daysAgo(i + 1),
        }));

    const lists = [
        ...keptLists,
        ...[
            { name: "Kitchen for the new flat", privacy: "shared", items: listItems([30, 31, 32, 33]) },
            { name: "Birthday wish list", privacy: "public", items: listItems([34, 35, 36]) },
        ]
            .filter((demo) => !keptLists.some((entry) => entry.name === demo.name))
            .map((demo) => ({ _id: new mongoose.Types.ObjectId(), ...demo, createdAt: daysAgo(20), seededBy: DEMO_TAG })),
    ];

    // Real views stay on top; demo views fill in behind them.
    const keptViews = strip(fresh.recentlyViewed);
    const recentlyViewed = [
        ...keptViews,
        ...Array.from({ length: 12 })
            .map((_, index) => pick(index + 13)._id)
            .filter((id) => !keptViews.some((entry) => String(entry.product) === String(id)))
            .map((id, index) => ({
                _id: new mongoose.Types.ObjectId(),
                product: id,
                style: 0,
                viewedAt: daysAgo(index + 1),
                seededBy: DEMO_TAG,
            })),
    ].slice(0, 20);

    // --- Markaz Movies: three titles saved, one bought and one rented, so My
    // list and Purchases & rentals both have something in them. Titles that can
    // be bought are the ones the video seeder gave a price.
    const priced = await videos.find({ price: { $gt: 0 } }).project({ price: 1 }).limit(8).toArray();
    const free = await videos.find({ price: 0 }).project({ _id: 1 }).limit(3).toArray();
    // The store's rental rule, the same one lib/movies.ts applies at runtime.
    const rentOf = (price) => round2(Math.max(1.99, Math.round(price * 0.4) - 0.01));

    const keptWatchlist = strip(fresh.watchlist);
    const keptLibrary = strip(fresh.library);
    const bought = priced[0];
    const rented = priced[1];
    const saved = [...free, ...priced.slice(2)].slice(0, 3);

    const watchlist = [
        ...keptWatchlist,
        ...saved
            .filter((video) => !keptWatchlist.some((entry) => String(entry.video) === String(video._id)))
            .map((video, index) => ({
                _id: new mongoose.Types.ObjectId(),
                video: video._id,
                addedAt: daysAgo(index + 2),
                seededBy: DEMO_TAG,
            })),
    ];

    const library = [
        ...keptLibrary,
        ...(bought
            ? [{ _id: new mongoose.Types.ObjectId(), video: bought._id, type: "buy", price: round2(bought.price), at: daysAgo(20), seededBy: DEMO_TAG }]
            : []),
        ...(rented
            ? [
                  {
                      _id: new mongoose.Types.ObjectId(),
                      video: rented._id,
                      type: "rent",
                      price: rentOf(rented.price),
                      at: daysAgo(6),
                      // Still running, so the rental shows a countdown.
                      expiresAt: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000),
                      seededBy: DEMO_TAG,
                  },
              ]
            : []),
    ];

    // The balance moves by exactly what the demo ledger adds (+50 redeemed, -5
    // spent), and only once however many times this runs.
    const keptLedger = strip(fresh.giftCardHistory);
    const priorDemoNet = (fresh.giftCardHistory || [])
        .filter((entry) => entry.seededBy === DEMO_TAG)
        .reduce((sum, entry) => sum + (entry.type === "used" ? -entry.amount : entry.amount), 0);
    const giftCardBalance = round2((fresh.giftCardBalance || 0) - priorDemoNet + 45);

    await users.updateOne(
        { _id: user._id },
        {
            $set: {
                address: addresses,
                whishlist: wishlist,
                membership,
                lists,
                recentlyViewed,
                watchlist,
                library,
                defaultPaymentMethod: fresh.defaultPaymentMethod || "paypal",
                giftCardBalance,
                giftCardHistory: [
                    ...keptLedger,
                    { code: DEMO_CODE, amount: 50, type: "redeemed", at: daysAgo(13), seededBy: DEMO_TAG },
                    { code: "", amount: 5, type: "used", at: daysAgo(11), seededBy: DEMO_TAG },
                ],
            },
        }
    );

    console.log("");
    console.log(`demo state written for ${email}`);
    console.log(`  orders          ${written.length} (2 delivered, 1 dispatched, 1 processing, 1 discounted, 1 cancelled)`);
    console.log(`  returns         1 refunded request on the 90-day-old order`);
    console.log(`  reviews         up to ${reviewed.length}, all Verified Purchase (hand-written ones kept)`);
    console.log(`  wishlist        ${wishlist.length} items`);
    console.log(`  history         ${recentlyViewed.length} products`);
    console.log(`  addresses       ${addresses.length}`);
    console.log(`  membership      Markaz Plus, ${membership.status}`);
    console.log(`  lists           ${lists.length} (${lists.filter((entry) => entry.privacy !== "private").length} shareable)`);
    console.log(`  movies          ${watchlist.length} on My list, ${library.length} bought or rented`);
    console.log(`  gift balance    $${giftCardBalance.toFixed(2)}`);
    console.log("");
    console.log("One order is still inside the 30-day window, so the Returns Center has a card to file against.");

    await mongoose.disconnect();
};

run().catch(async (error) => {
    console.error(error.message);
    await mongoose.disconnect();
    process.exit(1);
});
