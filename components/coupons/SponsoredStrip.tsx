import Link from "next/link";
import Image from "next/image";

import { InformationCircleIcon } from "@heroicons/react/24/outline";

import { priceParts } from "@/lib/coupons";

// The ad rail above the hero. It runs on a real catalog listing rather than a
// pasted screenshot, so the price and the saving are the product's own.
const SponsoredStrip = ({ product }: any) => {
    if (!product) {
        return null;
    }

    const { whole, cents } = priceParts(product.youPay);
    const href = `/product/${product.slug}?style=0`;

    return (
        <section aria-label="Sponsored" className="bg-white">
            <div className="max-w-[1500px] mx-auto px-4 pt-3">
                <div className="border border-slate-200 rounded flex items-center gap-4 px-4 py-2">
                    {product.image && (
                        <Link href={href} className="shrink-0">
                            <Image
                                src={product.image}
                                alt={product.name}
                                width={90}
                                height={70}
                                className="object-contain h-[70px] w-[90px]"
                            />
                        </Link>
                    )}

                    <div className="min-w-0 grow">
                        <Link href={href} className="font-bold text-sm md:text-base hover:underline line-clamp-1">
                            {product.name}
                        </Link>
                        <p className="text-xs md:text-sm text-slate-700 line-clamp-1">
                            {product.sold > 0
                                ? `${product.sold.toLocaleString()} bought in the past month`
                                : "Shop the coupon selection"}
                        </p>
                    </div>

                    <div className="shrink-0 text-right">
                        <p className="flex items-start justify-end">
                            {product.coupon > 0 && (
                                <span className="text-danger text-sm mr-2 self-center">
                                    -{product.coupon}%
                                </span>
                            )}
                            <span className="text-xs mt-1">$</span>
                            <span className="text-xl font-medium leading-none">{whole}</span>
                            <span className="text-xs">{cents}</span>
                        </p>

                        {product.coupon > 0 && (
                            <p className="text-xs text-slate-700">
                                List Price:{" "}
                                <span className="line-through">
                                    ${Number(product.listPrice).toFixed(2)}
                                </span>{" "}
                                <span className="text-accent-ink italic font-bold">plus</span>
                            </p>
                        )}
                    </div>
                </div>

                <p className="flex items-center justify-end gap-1 text-[11px] text-slate-500 py-1">
                    Sponsored
                    <InformationCircleIcon className="w-3.5 h-3.5" />
                </p>
            </div>
        </section>
    );
};

export default SponsoredStrip;
