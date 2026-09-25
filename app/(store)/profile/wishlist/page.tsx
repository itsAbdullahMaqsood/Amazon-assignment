import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import { toSavedItem } from "@/lib/account";
import { PageHeader } from "@/components/ui/Layout";
import SavedItems from "@/components/account/SavedItems";

export const metadata = { title: "Saved items" };

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/wishlist");
    }

    await connectDb();

    const user: any = await User.findById(session.user.id)
        .select("whishlist")
        .populate({
            path: "whishlist.product",
            model: Product,
            select: "name slug rating numberReviews shipping subProducts",
        })
        .lean();

    // A product deleted from the catalogue leaves an entry pointing at nothing.
    const items = (user?.whishlist || []).filter((entry: any) => entry.product).map(toSavedItem);

    return (
        <>
            <PageHeader
                title="Saved items"
                description={
                    <>
                        Things you kept for later, priced as they are today. For named lists you can share, see{" "}
                        <Link href="/lists" className="text-link">
                            your lists
                        </Link>
                        .
                    </>
                }
            />
            <SavedItems items={JSON.parse(JSON.stringify(items))} />
        </>
    );
};

export default Page;
