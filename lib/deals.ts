import connectDb from "@/lib/db";
import Coupon from "@/models/Coupon";
import { getBrowseData } from "@/lib/browse";

const today = () => new Date().toISOString().slice(0, 10);

// The codes that would actually be accepted at checkout right now, read from the
// Coupon collection and filtered by the same date test `checkCoupon` applies. A
// code that has not started or has expired is not shown at all, rather than
// shown with a countdown to nothing.
export const getActiveCoupons = async () => {
    await connectDb();

    const now = today();
    const coupons: any[] = await Coupon.find({ startDate: { $lte: now }, endDate: { $gte: now } })
        .sort({ discount: -1 })
        .lean();

    return coupons.map((entry) => ({ code: entry.coupon, percent: entry.discount, endDate: entry.endDate }));
};

export const getDealsData = async (query: any) => {
    const [data, coupons] = await Promise.all([getBrowseData(query, { dealsOnly: true }), getActiveCoupons()]);

    return { data, coupons };
};
