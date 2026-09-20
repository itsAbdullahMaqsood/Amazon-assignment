import Link from "next/link";
import Image from "next/image";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

import Price from "@/components/shared/Price";

// The single ad Amazon slots under the order list. It runs on a real catalog
// listing, so the price it shows is the product's own.
const SponsoredOrder = ({ product }: any) => {
    if (!product) {
        return null;
    }

    const href = `/product/${product.slug}?style=0`;
    const [brand, ...rest] = String(product.name).split(" ");

    return (
        <section aria-label="Sponsored" className="max-w-[820px] mx-auto mt-10">
            <div className="border border-slate-300 rounded flex items-center gap-4 p-2">
                <Link href={href} className="shrink-0">
                    <Image
                        src={product.image}
                        alt={product.name}
                        width={240}
                        height={110}
                        className="object-contain h-[110px] w-[240px] bg-white"
                    />
                </Link>

                <div className="min-w-0 grow">
                    <Link href={href} className="block text-lg hover:underline line-clamp-1">
                        <span className="font-bold">{brand}</span> {rest.join(" ")}
                    </Link>
                    <p className="text-sm text-slate-700 line-clamp-1">
                        {product.sold > 0
                            ? `${product.sold.toLocaleString()} bought in the past month`
                            : "Shop this deal"}
                    </p>
                </div>

                <div className="shrink-0 pr-2">
                    <Price value={product.price} size="md" />
                </div>
            </div>

            <p className="flex items-center justify-end gap-1 text-[11px] text-slate-500 py-1">
                Sponsored
                <InformationCircleIcon className="w-3.5 h-3.5" />
            </p>
        </section>
    );
};

export default SponsoredOrder;
