import { Suspense } from "react";

import { getBrowseData } from "@/lib/browse";
import BrowseView from "@/components/browse/BrowseView";

export const generateMetadata = async ({ searchParams }: any) => {
    const query = (await searchParams) || {};

    return { title: query.search ? `Results for “${query.search}”` : "Browse" };
};

const Page = async ({ searchParams }: any) => {
    const data = await getBrowseData((await searchParams) || {});

    return (
        <Suspense>
            <BrowseView data={data} />
        </Suspense>
    );
};

export default Page;
