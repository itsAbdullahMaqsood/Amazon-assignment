import connectDb from "@/lib/db";
import Product from "@/models/Product";
import User from "@/models/User";
import { applyDiscount, inStock, lowestPrice } from "@/lib/price";

const DELIVERY_DAYS = 4;

export const deliveryLabel = () => {
    const date = new Date();
    date.setDate(date.getDate() + DELIVERY_DAYS);

    return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
};

// Shapes one product into what a product card renders, deriving every badge
// from data the catalogue actually holds. The price is the cheapest thing the
// listing sells after its variant's discount; `fromPrice` says whether other
// options cost more.
export const toCardProduct = (product: any) => {
    const subs = product.subProducts || [];
    const sub = subs[0] || {};
    const { price, listPrice, discount } = lowestPrice(product);
    const allPrices = subs.flatMap((entry: any) => (entry.sizes || []).map((size: any) => applyDiscount(size.price, entry.discount || 0)));
    const sold = subs.reduce((acc: number, entry: any) => acc + (entry.sold || 0), 0);
    const topPick = (product.rating || 0) >= 4.5 && (product.numberReviews || 0) >= 3;

    return {
        _id: String(product._id),
        name: product.name,
        slug: product.slug,
        brand: product.brand || "",
        image: sub.images?.[0]?.url || "",
        rating: product.rating || 0,
        numberReviews: product.numberReviews || 0,
        price,
        listPrice,
        discount,
        fromPrice: allPrices.some((value: number) => value > price),
        sold,
        colors: subs.length,
        // Seeded variants are photos, not named colours.
        variantLabel: subs.some((entry: any) => entry.color?.color) ? "colours" : "styles",
        hasOptions: subs.length > 1 || (sub.sizes || []).length > 1,
        inStock: inStock(product),
        // Top pick: rated 4.5 or better by at least three reviewers.
        topPick,
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
