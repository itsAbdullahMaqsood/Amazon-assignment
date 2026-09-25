import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import ProfileShell from "@/components/profile/ProfileShell";
import Price from "@/components/shared/Price";

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/recent");
    }

    await connectDb();

    const user: any = await User.findById(session.user.id)
        .select("recentlyViewed")
        .populate({
            path: "recentlyViewed.product",
            model: Product,
            select: "name slug subProducts",
        })
        .lean();

    const items = (user?.recentlyViewed || []).filter((entry: any) => entry.product);

    return (
        <ProfileShell title="Browsing History">
            {items.length === 0 ? (
                <div className="bg-white border border-slate-300 rounded-lg p-8 text-center">
                    <p className="font-semibold">You haven&apos;t viewed any products yet.</p>
                    <Link
                        href="/browse"
                        className="inline-block mt-4 px-6 py-2 rounded-full bg-accent text-ink-900"
                    >
                        Browse the catalog
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {items.map((entry: any, i: number) => {
                        const variant =
                            entry.product.subProducts?.[Number(entry.style) || 0] ||
                            entry.product.subProducts?.[0] ||
                            {};
                        const price = variant.sizes?.[0]?.price || 0;

                        return (
                            <Link
                                key={`${entry.product._id}-${i}`}
                                href={`/product/${entry.product.slug}?style=${entry.style || 0}`}
                                className="border border-slate-300 rounded-lg p-3 hover:shadow-md transition"
                            >
                                <div className="relative w-full h-[160px]">
                                    <Image
                                        src={variant.images?.[0]?.url || "/assets/images/no-image.png"}
                                        alt={entry.product.name}
                                        fill
                                        sizes="200px"
                                        className="object-contain"
                                    />
                                </div>
                                <p className="text-sm text-accent-ink mt-2 line-clamp-2">
                                    {entry.product.name}
                                </p>
                                <Price value={price} size="sm" className="mt-1" />
                            </Link>
                        );
                    })}
                </div>
            )}
        </ProfileShell>
    );
};

export default Page;
