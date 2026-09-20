import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import ProfileShell from "@/components/profile/ProfileShell";
import WishlistClient from "@/components/profile/WishlistClient";

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
            select: "name slug subProducts",
        })
        .lean();

    const items = (user?.whishlist || []).filter((entry: any) => entry.product);

    return (
        <ProfileShell title="Your Lists">
            <WishlistClient items={JSON.parse(JSON.stringify(items))} />
        </ProfileShell>
    );
};

export default Page;
