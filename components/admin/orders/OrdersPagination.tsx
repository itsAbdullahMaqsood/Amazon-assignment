"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import Pagination from "@/components/browse/Pagination";

// The storefront Pagination is controlled; here the page lives in the URL so the
// server renders it, and every other filter in the query is kept.
const OrdersPagination = ({ page, count }: any) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const go = (next: number) => {
        const params = new URLSearchParams(searchParams.toString());

        if (next > 1) {
            params.set("page", String(next));
        } else {
            params.delete("page");
        }

        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
    };

    return <Pagination page={page} count={count} onChange={go} />;
};

export default OrdersPagination;
