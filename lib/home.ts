import connectDb from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User";
import Video from "@/models/Video";
import { toCardProduct } from "@/lib/recommendations";
import { departmentHref } from "@/components/Header/navigation";


const serialize = (value: any) => JSON.parse(JSON.stringify(value));

// Everything the home page shows, in one pass of small queries. Rows that
// depend on the shopper (recently viewed, buy again) are only fetched when
// someone is signed in, and come back empty rather than padded.
export const getHomeData = async (userId?: string) => {
    await connectDb();

    const [departments, deals, topRated, movies, productCount] = await Promise.all([
        Product.aggregate([
            { $sort: { rating: -1, numberReviews: -1 } },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 },
                    image: { $first: { $arrayElemAt: [{ $arrayElemAt: ["$subProducts.images.url", 0] }, 0] } },
                },
            },
            { $lookup: { from: Category.collection.name, localField: "_id", foreignField: "_id", as: "category" } },
            { $unwind: "$category" },
            { $sort: { count: -1 } },
            { $project: { _id: 0, name: "$category.name", slug: "$category.slug", count: 1, image: 1 } },
        ]),
        Product.find({ "subProducts.discount": { $gt: 0 } })
            .sort({ "subProducts.discount": -1, rating: -1 })
            .limit(10)
            .lean(),
        Product.find({ numberReviews: { $gte: 3 } })
            .sort({ rating: -1, numberReviews: -1, "subProducts.sold": -1 })
            .limit(10)
            .lean(),
        Video.find({ posterPath: { $ne: "" } })
            .sort({ popularity: -1 })
            .limit(8)
            .select("title slug posterPath rating releaseDate mediaType")
            .lean(),
        Product.countDocuments(),
    ]);

    let recent: any[] = [];
    let buyAgain: any[] = [];

    if (userId) {
        const [user, orders]: any = await Promise.all([
            User.findById(userId)
                .select("recentlyViewed")
                .populate({ path: "recentlyViewed.product", model: Product })
                .lean(),
            Order.find({ user: userId, isPaid: true, status: { $ne: "Cancelled" } })
                .select("products.product")
                .sort({ createdAt: -1 })
                .limit(20)
                .lean(),
        ]);

        recent = (user?.recentlyViewed || [])
            .map((entry: any) => entry.product)
            .filter(Boolean)
            .slice(0, 10)
            .map(toCardProduct);

        const boughtIds = [
            ...new Set((orders as any[]).flatMap((order) => (order.products || []).map((line: any) => String(line.product)))),
        ].slice(0, 10);

        if (boughtIds.length) {
            const bought: any[] = await Product.find({ _id: { $in: boughtIds } }).lean();
            const byId = new Map(bought.map((product) => [String(product._id), product]));
            buyAgain = boughtIds.map((id) => byId.get(id)).filter(Boolean).map(toCardProduct);
        }
    }

    return serialize({
        departments: departments.map((department: any) => ({ ...department, href: departmentHref(department.slug) })),
        deals: deals.map(toCardProduct),
        topRated: topRated.map(toCardProduct),
        movies,
        recent,
        buyAgain,
        productCount,
    });
};
