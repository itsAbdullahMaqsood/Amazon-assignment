"use client";

import Link from "next/link";
import Image from "next/image";

import Price from "@/components/ui/Price";
import Rating from "@/components/ui/Rating";
import Button from "@/components/ui/Button";
import useAddToCart from "@/components/cart/useAddToCart";

// A product Shabana suggested: always a real catalogue row, with the price and
// rating the database holds, and an add-to-cart that goes through the same
// stock check as the product page.
const ProductSuggestion = ({ product, onNavigate }: any) => {
    const { add, isPending } = useAddToCart();
    const href = `/product/${product.slug}`;

    return (
        <article className="flex gap-3 rounded-card border border-line bg-surface p-2.5">
            <Link href={href} onClick={onNavigate} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-control bg-surface-muted">
                {product.image && <Image src={product.image} alt="" fill sizes="80px" className="object-contain p-1" />}
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
                <Link href={href} onClick={onNavigate} className="line-clamp-2 text-sm font-medium leading-snug text-fg hover:underline">
                    {product.name}
                </Link>

                {product.numberReviews > 0 && <Rating value={product.rating} count={product.numberReviews} className="mt-1" />}

                <div className="mt-auto flex items-end justify-between gap-2 pt-1.5">
                    <Price value={product.price} listPrice={product.listPrice} size="sm" showSaving={false} />
                    <Button
                        size="sm"
                        variant="outline"
                        loading={isPending(product._id)}
                        onClick={() => add({ productId: product._id })}
                    >
                        Add
                    </Button>
                </div>
            </div>
        </article>
    );
};

export default ProductSuggestion;
