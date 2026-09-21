import connectDb from "@/lib/db";
import Coupon from "@/models/Coupon";

// Server-only. UTC day, the same clock /api/user/applycoupon compares against.
export const todayString = () => new Date().toISOString().slice(0, 10);

export const listCoupons = async () => {
    await connectDb();

    const coupons = await Coupon.find().select("coupon discount startDate endDate createdAt").sort({ endDate: -1, coupon: 1 }).lean();

    return JSON.parse(JSON.stringify(coupons));
};

// A new coupon defaults to running from today for 30 days.
export const couponDefaults = () => ({
    startDate: todayString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
});
