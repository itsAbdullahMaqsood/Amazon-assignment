import { Suspense } from "react";

import { getDealsData } from "@/lib/deals";
import BrowseView from "@/components/browse/BrowseView";
import CouponStrip from "@/components/deals/CouponStrip";

export const metadata = { title: "Deals" };

// Deals is the browse grid with one thing changed: its scope is every listing
// that carries a discount. Same filters, same chips, same pagination.
const Page = async ({ searchParams }: any) => {
    const { data, coupons } = await getDealsData((await searchParams) || {});

    return (
        <Suspense>
            <BrowseView data={data}>
                <CouponStrip coupons={coupons} />
            </BrowseView>
        </Suspense>
    );
};

export default Page;
