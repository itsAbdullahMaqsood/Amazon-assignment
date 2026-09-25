import connectDb from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import { toCardProduct } from "@/lib/recommendations";
import { colorName } from "@/lib/colors";
import { escapeRegex } from "@/utils/regex";
import { sortOptions } from "@/lib/browseOptions";

export { sortOptions };

export const PAGE_SIZE = 24;

// Values older links still carry (the home page, Shabana, bookmarks).
const legacySorts: Record<string, string> = {
    topSelling: "popular",
    topReviewed: "rating",
    popular: "popular",
    newest: "newest",
    priceLowToHight: "price-asc",
    priceHighToLow: "price-desc",
};

const list = (value: any) =>
    String(value || "")
        .split("_")
        .map((part) => part.trim())
        .filter(Boolean);

// The price a shopper pays for the cheapest thing a listing sells, after the
// variant's discount. Sorting and the price filter run on this, never on the
// list price.
const effectivePrice = {
    $min: {
        $map: {
            input: "$subProducts",
            as: "s",
            in: {
                $multiply: [
                    { $min: "$$s.sizes.price" },
                    { $subtract: [1, { $divide: [{ $ifNull: ["$$s.discount", 0] }, 100] }] },
                ],
            },
        },
    },
};

const totalStock = { $sum: { $map: { input: "$subProducts", as: "s", in: { $sum: "$$s.sizes.qty" } } } };
const totalSold = { $sum: "$subProducts.sold" };

export const parseBrowseQuery = (query: any) => {
    const [min, max] = String(query.price || "").split("_");
    const search = String(query.search || "").trim().slice(0, 80);
    const requestedSort = legacySorts[query.sort] || query.sort || "";
    const sort = sortOptions.some((option) => option.value === requestedSort && (!option.searchOnly || search))
        ? requestedSort
        : search
          ? "relevance"
          : "popular";

    return {
        search,
        category: String(query.category || ""),
        sub: String(query.sub || ""),
        brands: list(query.brand),
        colors: list(query.color),
        sizes: list(query.size),
        min: min ? Math.max(0, Number(min)) || 0 : null,
        max: max ? Number(max) || null : null,
        rating: Number(query.rating) || 0,
        inStock: query.stock === "1",
        sort,
        page: Math.max(1, Number(query.page) || 1),
    };
};

export const getBrowseData = async (rawQuery: any) => {
    const q = parseBrowseQuery(rawQuery);

    await connectDb();

    const [categories, subCategories] = await Promise.all([
        Category.find().select("name slug").sort({ name: 1 }).lean(),
        SubCategory.find().select("name slug parent").sort({ name: 1 }).lean(),
    ]);

    // A category may arrive as a slug (links) or an id (older links).
    const category: any = (categories as any[]).find(
        (entry) => entry.slug === q.category || String(entry._id) === q.category
    );
    const sub: any = category
        ? (subCategories as any[]).find(
              (entry) => (entry.slug === q.sub || String(entry._id) === q.sub) && String(entry.parent) === String(category._id)
          )
        : null;

    // Search matches the product name and brand, and whole sub-categories whose
    // name matches ("laptop" finds every laptop, not only those named so).
    const pattern = q.search ? escapeRegex(q.search) : "";
    const matchingSubs = pattern
        ? (subCategories as any[]).filter((entry) => new RegExp(`\\b${pattern}`, "i").test(entry.name)).map((entry) => entry._id)
        : [];

    const searchMatch = pattern
        ? {
              $or: [
                  { name: { $regex: pattern, $options: "i" } },
                  { brand: { $regex: pattern, $options: "i" } },
                  ...(matchingSubs.length ? [{ subCategories: { $in: matchingSubs } }] : []),
              ],
          }
        : {};

    // The scope is what you are looking in; filters narrow within it. Facet
    // counts are taken over the scope so a filter never hides its own options.
    const departmentScope = { ...searchMatch };
    const scope: any = {
        ...searchMatch,
        ...(category && { category: category._id }),
        ...(sub && { subCategories: sub._id }),
    };

    // Colours are chosen by name, and each name stands for every swatch hex
    // that reads as it.
    const scopeHexes: string[] = (await Product.distinct("subProducts.color.color", scope)).filter(Boolean);
    const hexesFor = (names: string[]) => scopeHexes.filter((hex) => names.includes(colorName(hex)));

    const filterMatch: any = {
        ...(q.brands.length && { brand: { $in: q.brands } }),
        ...(q.colors.length && { "subProducts.color.color": { $in: hexesFor(q.colors) } }),
        ...(q.sizes.length && { "subProducts.sizes.size": { $in: q.sizes } }),
        ...(q.rating && { rating: { $gte: q.rating } }),
    };

    const derived = [
        { $addFields: { effectivePrice, totalStock, totalSold } },
        {
            $match: {
                ...(q.min !== null && { effectivePrice: { $gte: q.min } }),
                ...(q.max !== null && { effectivePrice: { ...(q.min !== null && { $gte: q.min }), $lte: q.max } }),
                ...(q.inStock && { totalStock: { $gt: 0 } }),
            },
        },
    ];

    const relevance = pattern
        ? [
              {
                  $addFields: {
                      relevance: {
                          $add: [
                              { $cond: [{ $regexMatch: { input: "$name", regex: `^${pattern}`, options: "i" } }, 4, 0] },
                              { $cond: [{ $regexMatch: { input: "$name", regex: pattern, options: "i" } }, 2, 0] },
                              { $cond: [{ $regexMatch: { input: { $ifNull: ["$brand", ""] }, regex: pattern, options: "i" } }, 1, 0] },
                          ],
                      },
                  },
              },
          ]
        : [];

    const sortStage: Record<string, any> = {
        relevance: { relevance: -1, rating: -1, _id: 1 },
        popular: { totalSold: -1, rating: -1, _id: 1 },
        rating: { rating: -1, numberReviews: -1, _id: 1 },
        newest: { createdAt: -1, _id: 1 },
        "price-asc": { effectivePrice: 1, _id: 1 },
        "price-desc": { effectivePrice: -1, _id: 1 },
    };

    const [result, brandFacet, colorFacet, sizeFacet, subFacet, departmentFacet, priceBounds] = await Promise.all([
        Product.aggregate([
            { $match: { ...scope, ...filterMatch } },
            ...derived,
            ...relevance,
            {
                $facet: {
                    items: [
                        { $sort: sortStage[q.sort] },
                        { $skip: (q.page - 1) * PAGE_SIZE },
                        { $limit: PAGE_SIZE },
                        { $project: { reviews: 0, description: 0, details: 0, questions: 0 } },
                    ],
                    total: [{ $count: "count" }],
                },
            },
        ]),
        Product.aggregate([
            { $match: { ...scope, brand: { $nin: ["", null] } } },
            { $group: { _id: "$brand", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
        ]),
        Product.aggregate([
            { $match: scope },
            { $unwind: "$subProducts" },
            { $group: { _id: "$subProducts.color.color", products: { $addToSet: "$_id" } } },
        ]),
        Product.aggregate([
            { $match: scope },
            { $unwind: "$subProducts" },
            { $unwind: "$subProducts.sizes" },
            { $group: { _id: "$subProducts.sizes.size", products: { $addToSet: "$_id" } } },
        ]),
        category
            ? Product.aggregate([
                  { $match: { ...searchMatch, category: category._id } },
                  { $unwind: "$subCategories" },
                  { $group: { _id: "$subCategories", count: { $sum: 1 } } },
              ])
            : Promise.resolve([]),
        Product.aggregate([{ $match: departmentScope }, { $group: { _id: "$category", count: { $sum: 1 } } }]),
        Product.aggregate([
            { $match: scope },
            { $addFields: { effectivePrice } },
            { $group: { _id: null, min: { $min: "$effectivePrice" }, max: { $max: "$effectivePrice" } } },
        ]),
    ]);

    const items = result[0]?.items || [];
    const total = result[0]?.total?.[0]?.count || 0;

    // Colour names merge swatches that read the same ("#000000" and "#1f2328"
    // are both Black).
    const colorCounts = new Map<string, Set<string>>();
    for (const entry of colorFacet as any[]) {
        const name = colorName(entry._id);
        if (!name) continue;
        const set = colorCounts.get(name) || new Set();
        entry.products.forEach((id: any) => set.add(String(id)));
        colorCounts.set(name, set);
    }

    const subCount = new Map((subFacet as any[]).map((entry) => [String(entry._id), entry.count]));
    const departmentCount = new Map((departmentFacet as any[]).map((entry) => [String(entry._id), entry.count]));

    const sizes = (sizeFacet as any[])
        .filter((entry) => entry._id && !/^one size$/i.test(entry._id))
        .map((entry) => ({ value: entry._id, count: entry.products.length }));

    return JSON.parse(
        JSON.stringify({
            query: q,
            products: items.map(toCardProduct),
            total,
            pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
            category: category ? { name: category.name, slug: category.slug } : null,
            sub: sub ? { name: sub.name, slug: sub.slug } : null,
            facets: {
                departments: (categories as any[])
                    .map((entry) => ({ name: entry.name, slug: entry.slug, count: departmentCount.get(String(entry._id)) || 0 }))
                    .filter((entry) => entry.count > 0)
                    .sort((a, b) => b.count - a.count),
                subs: category
                    ? (subCategories as any[])
                          .filter((entry) => String(entry.parent) === String(category._id))
                          .map((entry) => ({ name: entry.name, slug: entry.slug, count: subCount.get(String(entry._id)) || 0 }))
                          .filter((entry) => entry.count > 0)
                    : [],
                brands: (brandFacet as any[]).map((entry) => ({ value: entry._id, count: entry.count })),
                colors: [...colorCounts.entries()]
                    .map(([value, ids]) => ({ value, count: ids.size }))
                    .sort((a, b) => b.count - a.count),
                // Size facets only mean something when the scope sells more than
                // one kind of size; "One Size" is not a choice.
                sizes: sizes.length > 1 ? sizes : [],
                price: {
                    min: Math.floor(priceBounds[0]?.min || 0),
                    max: Math.ceil(priceBounds[0]?.max || 0),
                },
            },
        })
    );
};
