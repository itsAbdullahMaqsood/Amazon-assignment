import connectDb from "@/lib/db";
import Cart from "@/models/Cart";
import Coupon from "@/models/Coupon";
import Product from "@/models/Product";
import User from "@/models/User";
import { applyDiscount } from "@/lib/price";
import { applyAdjustments, summarize } from "@/lib/pricing";
import { hasPlusDelivery } from "@/lib/plusAccess";
import { findVariant } from "@/lib/stock";

const today = () => new Date().toISOString().slice(0, 10);

// Looks a coupon code up and says why it can't be used when it can't.
export const checkCoupon = async (code: string) => {
    const normalised = String(code || "").trim().toUpperCase();

    if (!normalised) return { coupon: null, error: "" };

    const coupon: any = await Coupon.findOne({ coupon: normalised }).lean();

    if (!coupon) return { coupon: null, error: `"${normalised}" isn't a valid code.` };
    if (today() < coupon.startDate) return { coupon: null, error: `"${normalised}" starts on ${coupon.startDate}.` };
    if (today() > coupon.endDate) return { coupon: null, error: `"${normalised}" expired on ${coupon.endDate}.` };

    return { coupon: { code: coupon.coupon, percent: coupon.discount }, error: "" };
};

// Everything an order would charge, recomputed from the database: each line's
// price, stock and delivery come from its product document as it is now, not
// from what was saved in the cart. The checkout page's summary and order
// creation both call this, so the preview is the charge.
export const computeQuote = async (userId: string, { coupon = "", useGiftCard = true }: any = {}) => {
    await connectDb();

    const [user, cart]: any = await Promise.all([
        User.findById(userId).select("giftCardBalance membership email").lean(),
        Cart.findOne({ user: userId }).lean(),
    ]);

    if (!cart || !cart.products?.length) {
        return null;
    }

    const products: any[] = await Product.find({ _id: { $in: cart.products.map((line: any) => line.product) } })
        .select("name slug shipping subProducts")
        .lean();
    const byId = new Map(products.map((product) => [String(product._id), product]));

    const problems: string[] = [];

    const lines = cart.products.map((line: any) => {
        const product = byId.get(String(line.product));
        const variant = product ? findVariant(product, line) : null;
        const row = variant?.sizes?.find((size: any) => size.size === line.size);

        if (!product || !row) {
            problems.push(`${line.name} is no longer available.`);
            return { ...line, unavailable: true, price: line.price, shipping: 0, stock: 0 };
        }

        if (row.qty < line.qty) {
            problems.push(
                row.qty < 1 ? `${line.name} has sold out.` : `Only ${row.qty} of ${line.name} left; your cart has ${line.qty}.`
            );
        }

        return {
            product: product._id,
            slug: product.slug,
            name: product.name,
            image: line.image,
            size: line.size,
            qty: line.qty,
            color: line.color,
            price: applyDiscount(row.price, variant.discount || 0),
            shipping: product.shipping || 0,
            stock: row.qty,
        };
    });

    const buyable = lines.filter((line: any) => !line.unavailable);
    // A Plus membership waives the delivery charges — the account's own, or one
    // shared with it through a household. Read here, never trusted from the
    // request.
    const { plus: member, through } = await hasPlusDelivery(user);
    const base = summarize(buyable, { freeDelivery: member });
    const { coupon: validCoupon, error: couponError } = await checkCoupon(coupon);
    const balance = useGiftCard ? Number(user?.giftCardBalance || 0) : 0;
    const adjusted = applyAdjustments(base, { couponPercent: validCoupon?.percent || 0, giftCardBalance: balance });

    return JSON.parse(
        JSON.stringify({
            lines,
            items: base.items,
            subtotal: base.subtotal,
            shipping: base.shipping,
            deliveryWaived: base.deliveryWaived,
            member,
            plusThrough: through,
            discount: adjusted.discount,
            giftCard: adjusted.giftCard,
            giftCardBalance: Number(user?.giftCardBalance || 0),
            total: adjusted.total,
            coupon: validCoupon,
            couponError,
            problems,
        })
    );
};
