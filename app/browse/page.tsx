import connectDb from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import MenuSideBar from "@/components/Header/MenuSidebar";
import BrowseClient from "@/components/browse/BrowseClient";
import { escapeRegex, alternationFromParam } from "@/utils/regex";
import { filterArray, removeDublicates, randomize } from "@/utils/array_utils";

const PAGE_SIZE = 10;

const sortOrders: any = {
    "": {},
    popular: { rating: -1, "subProducts.sold": -1 },
    newest: { createdAt: -1 },
    topSelling: { "subProducts.sold": -1 },
    topReviewed: { rating: -1 },
    priceHighToLow: { "subProducts.sizes.price": -1 },
    // Spelling kept: this is the value the UI sends.
    priceLowToHight: { "subProducts.sizes.price": 1 },
};

const regexFilter = (param: any) =>
    param ? { $regex: alternationFromParam(param), $options: "i" } : undefined;

const buildFilters = (query: any) => {
    const {
        search,
        category,
        brand,
        style,
        size,
        color,
        material,
        gender,
        price,
        shipping,
        rating,
    } = query;

    const [min, max] = String(price || "").split("_");

    const detailValues = [style, material, gender].filter(Boolean).join("_");

    const filters: any = {
        ...(search && { name: { $regex: escapeRegex(search), $options: "i" } }),
        ...(category && { category }),
        ...(brand && { brand: regexFilter(brand) }),
        ...(detailValues && { "details.value": regexFilter(detailValues) }),
        ...(size && { "subProducts.sizes.size": regexFilter(size) }),
        ...(color && { "subProducts.color.color": regexFilter(color) }),
        ...(price && {
            "subProducts.sizes.price": {
                $gte: Number(min) || 0,
                $lte: Number(max) || Infinity,
            },
        }),
        ...(shipping === "0" && { shipping: 0 }),
        ...(rating && { rating: { $gte: Number(rating) } }),
    };

    return filters;
};

const Page = async ({ searchParams }: any) => {
    const query = (await searchParams) || {};
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const sort = sortOrders[query.sort] ?? {};

    await connectDb();

    // Department links carry a slug so they survive a reseed; the sidebar still
    // sends the category id.
    const categoryId = /^[0-9a-f]{24}$/i.test(query.category || "")
        ? query.category
        : query.category
          ? String(
                (
                    (await Category.findOne({ slug: query.category })
                        .select("_id")
                        .lean()) as any
                )?._id || ""
            )
          : "";

    const filters = buildFilters({ ...query, category: categoryId });
    // The sidebar only offers values that exist inside the selected category.
    const categoryScope = categoryId ? { category: categoryId } : {};

    const [products, total, categories, subCategories, colors, brands, sizes, details] =
        await Promise.all([
            Product.find(filters)
                .skip(PAGE_SIZE * (page - 1))
                .limit(PAGE_SIZE)
                .sort(sort)
                .lean(),
            Product.countDocuments(filters),
            Category.find().lean(),
            SubCategory.find().populate({ path: "parent", model: Category }).lean(),
            Product.distinct("subProducts.color.color", categoryScope),
            Product.distinct("brand", categoryScope),
            Product.distinct("subProducts.sizes.size", categoryScope),
            Product.distinct("details", categoryScope),
        ]);

    const styles = removeDublicates(filterArray(details as any[], "Style"));
    const materials = removeDublicates(filterArray(details as any[], "Material"));

    // Without a chosen sort the page is shuffled so the grid does not look frozen.
    const ordered = query.sort ? products : randomize(products);

    return (
        <>
            <Header title="Browse Products" searchHandler={null} />

            <BrowseClient
                products={JSON.parse(JSON.stringify(ordered))}
                categories={JSON.parse(JSON.stringify(categories))}
                subCategories={JSON.parse(JSON.stringify(subCategories))}
                colors={(colors as string[]).filter(Boolean)}
                brands={(brands as string[]).filter(Boolean)}
                sizes={(sizes as string[]).filter(Boolean)}
                styles={styles.filter(Boolean)}
                materials={materials.filter(Boolean)}
                total={total}
                page={page}
                pageSize={PAGE_SIZE}
                paginationCount={Math.ceil(total / PAGE_SIZE)}
            />

            <Footer />

            <MenuSideBar />
        </>
    );
};

export default Page;
