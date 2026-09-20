"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { TrashIcon } from "@heroicons/react/24/outline";

import Price from "@/components/shared/Price";

const variantOf = (entry: any) => {
    const index = Number(entry.style) || 0;
    return entry.product?.subProducts?.[index] || entry.product?.subProducts?.[0] || {};
};

const WishlistClient = ({ items }: any) => {
    const [list, setList] = useState<any[]>(items);
    const [error, setError] = useState<string>("");

    const removeHandler = async (entry: any) => {
        try {
            const { data } = await axios.delete("/api/user/wishlist", {
                data: { product_id: entry.product._id, style: entry.style },
            });
            setList(data.whishlist);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        }
    };

    if (!list.length) {
        return (
            <div className="bg-white border border-slate-300 rounded-lg p-8 text-center">
                <p className="font-semibold">Your list is empty.</p>
                <Link
                    href="/browse"
                    className="inline-block mt-4 px-6 py-2 rounded-full bg-linear-to-r from-amazon-orange to-yellow-300 text-amazon-blue_dark"
                >
                    Find something to save
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {list.map((entry: any) => {
                const variant = variantOf(entry);
                const listPrice = variant.sizes?.[0]?.price || 0;
                const discount = variant.discount || 0;
                const price = discount > 0 ? listPrice - (listPrice * discount) / 100 : listPrice;

                return (
                    <div
                        key={`${entry.product._id}-${entry.style}`}
                        className="flex items-center gap-4 bg-white border border-slate-300 rounded-lg p-4"
                    >
                        <Link href={`/product/${entry.product.slug}?style=${entry.style}`}>
                            <Image
                                src={variant.images?.[0]?.url || "/assets/images/no-image.png"}
                                alt={entry.product.name}
                                width={90}
                                height={90}
                                className="rounded object-cover w-[90px] h-[90px]"
                            />
                        </Link>

                        <div className="flex-1">
                            <Link
                                href={`/product/${entry.product.slug}?style=${entry.style}`}
                                className="text-[#0F5FA6] hover:underline font-semibold"
                            >
                                {entry.product.name}
                            </Link>
                            <div className="mt-1">
                                <Price value={price} listPrice={discount ? listPrice : null} discount={discount} size="sm" />
                            </div>
                        </div>

                        <button
                            onClick={() => removeHandler(entry)}
                            aria-label={`Remove ${entry.product.name} from your list`}
                            className="p-2 rounded hover:bg-slate-100 cursor-pointer"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default WishlistClient;
