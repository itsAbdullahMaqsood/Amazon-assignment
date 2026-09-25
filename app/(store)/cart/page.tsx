import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Product from "@/models/Product";
import User from "@/models/User";
import { toCardProduct } from "@/lib/recommendations";
import { hasPlusDelivery } from "@/lib/plusAccess";
import CartView from "@/components/cart/CartView";

export const metadata = { title: "Your cart" };

// Open to everyone: a guest can fill a cart, and signing in happens at
// checkout. Below the cart, a row of what the shopper looked at recently, or
// the store's best-rated products for a guest.
const Page = async () => {
    const session = await auth();

    await connectDb();

    let suggestions: any[] = [];
    let suggestionsTitle = "Top rated right now";
    let member = false;

    if (session) {
        const user: any = await User.findById(session.user.id)
            .select("recentlyViewed membership email")
            .populate({ path: "recentlyViewed.product", model: Product })
            .lean();

        suggestions = (user?.recentlyViewed || []).map((entry: any) => entry.product).filter(Boolean).slice(0, 5).map(toCardProduct);
        suggestionsTitle = "Recently viewed";
        member = (await hasPlusDelivery(user)).plus;
    }

    if (!suggestions.length) {
        suggestions = ((await Product.find({ numberReviews: { $gte: 3 } }).sort({ rating: -1 }).limit(5).lean()) as any[]).map(toCardProduct);
        suggestionsTitle = "Top rated right now";
    }

    return <CartView suggestions={JSON.parse(JSON.stringify(suggestions))} suggestionsTitle={suggestionsTitle} member={member} />;
};

export default Page;
