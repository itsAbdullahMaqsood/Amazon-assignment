import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

import connectDb from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import Price from "@/components/shared/Price";
import StarRating from "@/components/shared/StarRating";
import AddToCartButton from "@/components/shared/AddToCartButton";
import RegistryNav from "@/components/registry/RegistryNav";
import RegistryArt from "@/components/registry/art";
import { occasionOf, registryDate, toRegistryItem, toRegistryResult } from "@/lib/registry";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "List or Registry",
};

// A list is owned by a user, so the list is found through its owner and the
// owner's name travels with it onto the page.
const loadRegistry = async (id: string) => {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }

    const owner: any = await User.findOne({ "lists._id": id }).select("name lists").lean();

    const list = (owner?.lists || []).find((entry: any) => String(entry._id) === id);

    // A private list is only ever seen by its owner on /profile, so it is not
    // served here at all; a shared one is reachable by whoever has the link.
    if (!list || list.privacy === "private") {
        return null;
    }

    // The saved items are two arrays deep, which populate does not reach, so the
    // products they point at are fetched and joined on here.
    const saved = (list.items || []).filter((entry: any) => entry.product);

    const products = await Product.find({ _id: { $in: saved.map((entry: any) => entry.product) } })
        .select("name slug rating numberReviews subProducts")
        .lean();

    const byId = new Map(products.map((product: any) => [String(product._id), product]));

    return {
        registry: toRegistryResult(owner, list),
        items: saved
            .map((entry: any) => ({ ...entry, product: byId.get(String(entry.product)) }))
            .filter((entry: any) => entry.product)
            .map(toRegistryItem),
    };
};

const Page = async ({ params }: any) => {
    const { id } = await params;

    await connectDb();

    const data = await loadRegistry(String(id));

    if (!data) {
        notFound();
    }

    const { registry, items } = data;

    return (
        <>

            <main className="bg-surface-muted min-h-[60vh]">
                <div className="bg-white">
                    <RegistryNav />
                </div>

                <div className="max-w-[1200px] mx-auto px-4 py-8">
                    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-slate-600">
                        <Link href="/registry" className="hover:underline">
                            Registry &amp; Gifting
                        </Link>
                        <ChevronRightIcon className="h-3 mx-1" />
                        <Link href="/registry/find" className="hover:underline">
                            Find a List or Registry
                        </Link>
                        <ChevronRightIcon className="h-3 mx-1" />
                        <span>{registry.name}</span>
                    </nav>

                    <header className="mt-3 bg-white border border-slate-300 rounded-lg p-6 flex items-center gap-6">
                        <RegistryArt art={registry.occasion} className="h-24 w-24 shrink-0" />

                        <div>
                            <p className="text-sm text-slate-600">{occasionOf(registry.occasion).label}</p>
                            <h1 className="text-3xl font-bold">{registry.name}</h1>
                            <p className="mt-1">{registry.owner}</p>
                            <p className="mt-1 text-sm text-slate-600">
                                {items.length} {items.length === 1 ? "item" : "items"}
                                {registry.createdAt && ` · Created ${registryDate(registry.createdAt)}`}
                                {registry.privacy === "shared" && " · Shared by link"}
                            </p>
                        </div>
                    </header>

                    {items.length ? (
                        <ul className="mt-6 grid gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                            {items.map((item: any) => (
                                <li
                                    key={`${item._id}-${item.style}`}
                                    className="bg-white border border-slate-300 rounded-lg p-4 flex flex-col"
                                >
                                    <Link href={`/product/${item.slug}?style=${item.style}`}>
                                        <Image
                                            src={item.image || "/assets/images/no-image.png"}
                                            alt={item.name}
                                            width={220}
                                            height={220}
                                            className="w-full h-[180px] object-contain"
                                        />
                                    </Link>

                                    <Link
                                        href={`/product/${item.slug}?style=${item.style}`}
                                        className="mt-3 text-accent-ink hover:underline line-clamp-2"
                                    >
                                        {item.name}
                                    </Link>

                                    <div className="mt-1 flex items-center gap-2">
                                        <StarRating value={item.rating} size="w-4 h-4" />
                                        <span className="text-xs text-slate-600">{item.numberReviews}</span>
                                    </div>

                                    <div className="mt-2">
                                        <Price
                                            value={item.price}
                                            listPrice={item.discount ? item.listPrice : null}
                                            discount={item.discount}
                                            size="sm"
                                        />
                                    </div>

                                    <div className="mt-auto">
                                        <AddToCartButton productId={item._id} style={item.style} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="mt-6 bg-white border border-slate-300 rounded-lg p-8">
                            <p className="font-semibold">Nothing has been added to this list yet.</p>
                            <Link
                                href="/registry/find"
                                className="inline-block mt-4 text-accent-ink hover:underline"
                            >
                                Search for another list or registry
                            </Link>
                        </div>
                    )}
                </div>
            </main>


        </>
    );
};

export default Page;
