// Seeds the Prime Video catalog from TMDB.
//   npm run seed:videos            seed only when the collection is empty
//   npm run seed:videos -- --reset wipe and reseed
// Needs TMDB_API_KEY in .env.local (a free v3 key from themoviedb.org).
import mongoose from "mongoose";
import slugify from "slugify";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const KEY = process.env.TMDB_API_KEY;
const BASE = "https://api.themoviedb.org/3";

// Each row maps to a TMDB query; nothing here is a hardcoded title list.
const ROWS = [
    { row: "popular-now", label: "Popular now", path: "/trending/all/week", params: {} },
    {
        row: "action-adventure",
        label: "Action and adventure movies",
        path: "/discover/movie",
        params: { with_genres: "28,12", sort_by: "popularity.desc" },
    },
    {
        row: "mystery-thriller",
        label: "Mystery and thriller movies",
        path: "/discover/movie",
        params: { with_genres: "9648,53", sort_by: "popularity.desc" },
    },
    {
        row: "featured-originals",
        label: "Featured Originals and Exclusives",
        path: "/discover/tv",
        // TMDB network 1024 is Prime Video.
        params: {
            with_networks: "1024",
            with_original_language: "en",
            "vote_count.gte": "200",
            sort_by: "popularity.desc",
        },
        original: true,
    },
    {
        row: "deals-under-5",
        label: "$4.99 or less movie deals",
        path: "/discover/movie",
        params: { sort_by: "vote_count.desc", "vote_average.gte": "7" },
        priceBand: [1.99, 4.99],
    },
    {
        row: "drama-movies",
        label: "Drama movies",
        path: "/discover/movie",
        params: { with_genres: "18", sort_by: "popularity.desc" },
    },
    {
        row: "under-10-price-drops",
        label: "Under $10: New movie price drops",
        path: "/discover/movie",
        params: { sort_by: "primary_release_date.desc", "vote_count.gte": "50" },
        priceBand: [5.99, 9.99],
    },
];

const get = async (path, params = {}) => {
    const url = new URL(BASE + path);
    url.searchParams.set("api_key", KEY);
    url.searchParams.set("language", "en-US");
    url.searchParams.set("include_adult", "false");
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`TMDB ${res.status} for ${path}`);
    }

    return res.json();
};

const daysSince = (date) => (date ? (Date.now() - new Date(date).getTime()) / 86400000 : Infinity);

// Badges are derived from the data, not assigned by hand.
const badgeFor = (item, mediaType, priced) => {
    const age = daysSince(item.release_date || item.first_air_date);

    if (priced) return "DEAL";
    if (mediaType === "tv" && age <= 120) return "NEW SERIES";
    if (mediaType === "tv" && age <= 400) return "NEW SEASON";
    if (mediaType === "movie" && age <= 150) return "NEW MOVIE";
    if ((item.vote_average || 0) >= 7.5) return "MOST LIKED";
    return "";
};

const priceFor = (band, id) => {
    if (!band) return 0;
    const [min, max] = band;
    const steps = Math.round((max - min) / 1) || 1;
    return Number((min + (id % (steps + 1))).toFixed(2));
};

const run = async () => {
    const reset = process.argv.includes("--reset");

    if (!KEY) {
        console.error("TMDB_API_KEY is not set. Add it to .env.local and run `npm run seed:videos` again.");
        process.exit(1);
    }

    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI is not set.");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    console.log(`connected to database "${db.databaseName}"`);

    if (reset) {
        await db.collection("videos").deleteMany({});
        console.log("reset: videos cleared");
    }

    const existing = await db.collection("videos").countDocuments();

    if (existing > 0) {
        console.log(`videos collection already has ${existing} documents; nothing seeded.`);
        console.log("run `npm run seed:videos -- --reset` to wipe and reseed.");
        await mongoose.disconnect();
        return;
    }

    const [movieGenres, tvGenres] = await Promise.all([
        get("/genre/movie/list"),
        get("/genre/tv/list"),
    ]);
    const genreName = new Map(
        [...movieGenres.genres, ...tvGenres.genres].map((g) => [g.id, g.name])
    );

    const byKey = new Map();

    for (const config of ROWS) {
        const data = await get(config.path, { ...config.params, page: 1 });
        const items = (data.results || []).slice(0, 14);

        for (const item of items) {
            const mediaType = item.media_type || (config.path.includes("/tv") ? "tv" : "movie");
            const title = item.title || item.name;

            if (!title || !item.poster_path) {
                continue;
            }

            const key = `${mediaType}-${item.id}`;
            const price = priceFor(config.priceBand, item.id);

            if (byKey.has(key)) {
                const seen = byKey.get(key);
                seen.rows.push(config.row);

                // A title can appear in a free row first and a priced row later;
                // without this it would sit in the deals row with no price.
                if (config.priceBand && !seen.price) {
                    seen.price = price;
                    seen.badge = "DEAL";
                }

                continue;
            }

            byKey.set(key, {
                tmdbId: item.id,
                mediaType,
                title,
                slug: slugify(`${title}-${item.id}`, { lower: true, strict: true }),
                overview: item.overview || "",
                posterPath: item.poster_path,
                backdropPath: item.backdrop_path || "",
                genres: (item.genre_ids || []).map((id) => genreName.get(id)).filter(Boolean),
                rating: item.vote_average || 0,
                popularity: item.popularity || 0,
                voteCount: item.vote_count || 0,
                releaseDate: item.release_date || item.first_air_date || "",
                maturity: mediaType === "tv" ? "TV-MA" : "PG-13",
                badge: badgeFor(item, mediaType, Boolean(config.priceBand)),
                price,
                isOriginal: Boolean(config.original),
                rows: [config.row],
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        console.log(`${config.label}: ${items.length} titles`);
    }

    const docs = [...byKey.values()];
    await db.collection("videos").insertMany(docs);

    console.log(`\ntotal titles: ${docs.length}`);
    console.log(`with backdrops (hero candidates): ${docs.filter((d) => d.backdropPath).length}`);

    await mongoose.disconnect();
};

run().catch(async (error) => {
    console.error(error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
