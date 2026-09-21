import { requireAdminPage } from "@/lib/guard";
import { PageHeader } from "@/components/admin/ui";
import CouponManager from "@/components/admin/coupons/CouponManager";
import { couponDefaults, listCoupons, todayString } from "@/components/admin/coupons/queries";

export const metadata = { title: "Coupons" };

const CouponsPage = async () => {
    await requireAdminPage("/admin/dashboard/coupons");

    const coupons = await listCoupons();

    // The clock is read on the server and handed down; the client only compares strings.
    const today = todayString();

    return (
        <>
            <PageHeader
                title="Coupons"
                description="Codes shoppers enter at checkout. A coupon works from its start date through its end date."
            />
            <CouponManager initial={coupons} today={today} defaults={couponDefaults()} />
        </>
    );
};

export default CouponsPage;
