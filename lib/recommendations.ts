import connectDb from "@/lib/db";
import Product from "@/models/Product";
import User from "@/models/User";

const DELIVERY_DAYS = 4;

export const deliveryLabel = () => {
    const date = new Date();
    date.setDate(date.getDate() + DELIVERY_DAYS);

    return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
};

// Shapes one product into what the recommendation card renders, deriving the
// badges from the data the catalog actually holds.
export const toCardProduct = (product: any) => {
    const sub = product.subProducts?.[0] || {};
    const prices = (sub.sizes || []).map((size: any) => size.price).sort((a: number, b: number) => a - b);
    const listPrice = prices[0] || 0;
    const discount = sub.discount || 0;
    const price = discount > 0 ? Number((listPrice - (listPrice * discount) / 100).toFixed(2)) : listPrice;
    const sold = (product.subProducts || []).reduce(
        (acc: number, entry: any) => acc + (entry.sold || 0),
        0
    );

    return {
        _id: String(product._id),
        name: product.name,
        slug: product.slug,
        image: sub.images?.[0]?.url || "",
        rating: product.rating || 0,
        numberReviews: product.numberReviews || 0,
        price,
        listPrice,
        discount,
        sold,
        // Amazon's Choice: well rated and selling; Limited time deal: an active discount.
        amazonChoice: (product.rating || 0) >= 4 && sold >= 200,
        limitedDeal: discount > 0,
        shipping: product.shipping || 0,
    };
};

export const getRecommendations = async (userId: string) => {
    await connectDb();

    const user: any = await User.findById(userId)
        .select("recentlyViewed")
        .populate({ path: "recentlyViewed.product", model: Product, select: "category subCategories" })
        .lean();

    const viewed = (user?.recentlyViewed || []).filter((entry: any) => entry.product);
    const viewedIds = viewed.map((entry: any) => entry.product._id);
    const categories = [...new Set(viewed.map((entry: any) => String(entry.product.category)))];
    const subCategories = [
        ...new Set(viewed.flatMap((entry: any) => (entry.product.subCategories || []).map(String))),
    ];

    const popular = () =>
        Product.find().sort({ rating: -1, "subProducts.sold": -1 }).limit(18).lean();

    const [byCategory, bySubCategory] = await Promise.all([
        categories.length
            ? Product.find({ category: { $in: categories }, _id: { $nin: viewedIds } })
                  .sort({ rating: -1 })
                  .limit(18)
                  .lean()
            : popular(),
        subCategories.length
            ? Product.find({ subCategories: { $in: subCategories }, _id: { $nin: viewedIds } })
                  .sort({ "subProducts.sold": -1 })
                  .limit(18)
                  .lean()
            : popular(),
    ]);

    return {
        alsoViewed: byCategory.map(toCardProduct),
        related: bySubCategory.map(toCardProduct),
    };
};

// Most-recent-first, de-duplicated by product+style, capped at 20.
export const recordProductView = async (userId: string, productId: string, style: number) => {
    await connectDb();

    const user: any = await User.findById(userId).select("recentlyViewed");

    if (!user) {
        return;
    }

    const next = [
        { product: productId, style, viewedAt: new Date() },
        ...(user.recentlyViewed || []).filter(
            (entry: any) => String(entry.product) !== String(productId)
        ),
    ].slice(0, 20);

    user.recentlyViewed = next;
    await user.save();
};
