// Pure mappers shared by the /coupons server page and its client components.
// Nothing here touches mongoose, so the client bundle can import it too.

const round2 = (value: number) => Number(Number(value).toFixed(2));

// The coupon sits on the colour variant that carries the deepest discount, which
// is the variant Amazon shows the "You pay ... with coupon" line for.
const bestVariant = (product: any) => {
    const subs = product.subProducts || [];

    return subs.reduce(
        (acc: any, sub: any) => ((sub.discount || 0) > (acc?.discount || 0) ? sub : acc),
        subs[0] || {}
    );
};

export const toCouponProduct = (product: any) => {
    const sub = bestVariant(product);
    const prices = (sub.sizes || [])
        .map((size: any) => size.price)
        .sort((a: number, b: number) => a - b);

    const listPrice = prices[0] || 0;
    const coupon = sub.discount || 0;
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
        listPrice,
        coupon,
        youPay: round2(listPrice - (listPrice * coupon) / 100),
        sold,
        colors: (product.subProducts || []).length,
    };
};

// The badge under a featured deal card, derived from the catalog rather than
// invented: what is selling goes out fast, what is deeply cut is a Prime deal.
export const dealLabel = (deal: any) => {
    if (deal.sold >= 500) {
        return "Deal selling fast";
    }

    if (deal.coupon >= 30) {
        return "Early Prime Big Deal";
    }

    return "Limited time deal";
};

// Deals cut by a quarter or more run on a clock instead of a static label.
export const dealEnds = (deal: any) => deal.coupon >= 25;

// 264200 -> "264.2K", matching the review counts on the real grid.
export const compactCount = (value: number) => {
    const count = Number(value) || 0;

    if (count >= 1000) {
        const thousands = count / 1000;
        return `${thousands >= 100 ? Math.round(thousands) : thousands.toFixed(1)}K`;
    }

    return String(count);
};

export const priceParts = (value: number) => {
    const [whole, cents = "00"] = Number(value || 0).toFixed(2).split(".");
    return { whole, cents };
};

export const discountTiers = [
    { label: "All Discounts", value: "" },
    { label: "10% off or more", value: "10" },
    { label: "25% off or more", value: "25" },
    { label: "50% off or more", value: "50" },
];
