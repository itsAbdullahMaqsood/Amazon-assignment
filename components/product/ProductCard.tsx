"use client";

import Link from "next/link";
import Image from "next/image";
import { PlusIcon } from "@heroicons/react/24/outline";

import Price from "@/components/ui/Price";
import Rating from "@/components/ui/Rating";
import Badge from "@/components/ui/Badge";
import { cn } from "@/components/ui/cn";
import useAddToCart from "@/components/cart/useAddToCart";

// The one product card. Image, name, rating, price and delivery: the five things
// a shopper compares, in that order, with nothing sponsored in between. A
// product with a single option can go straight into the cart from here; one
// with colours or sizes opens its page, because picking for the shopper is a
// guess.
const ProductCard = ({ product, priority = false, className = "", sizes = "(max-width: 768px) 45vw, 240px" }: any) => {
    const { add, isPending } = useAddToCart();
    const href = `/product/${product.slug}`;

    return (
        <article className={cn("group relative flex flex-col", className)}>
            <div className="relative aspect-square overflow-hidden rounded-card bg-surface-muted">
                <Link href={href} tabIndex={-1} aria-hidden="true">
                    {product.image && (
                        <Image
                            src={product.image}
                            alt=""
                            fill
                            sizes={sizes}
                            priority={priority}
                            className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                    )}
                </Link>

                <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
                    {product.discount > 0 && <Badge tone="success">−{product.discount}%</Badge>}
                    {product.topPick && <Badge tone="accent">Top pick</Badge>}
                </div>

                {!product.inStock ? (
                    <span className="absolute inset-x-2 bottom-2 rounded-control bg-surface/90 py-1 text-center text-xs font-medium text-fg-muted">
                        Out of stock
                    </span>
                ) : (
                    !product.hasOptions && (
                        <button
                            type="button"
                            onClick={() => add({ productId: product._id })}
                            disabled={isPending(product._id)}
                            aria-label={`Add ${product.name} to cart`}
                            className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-fg shadow-card ring-1 ring-line transition hover:bg-accent disabled:opacity-60 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 cursor-pointer"
                        >
                            {isPending(product._id) ? (
                                <span className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin" />
                            ) : (
                                <PlusIcon className="h-5 w-5 stroke-2" />
                            )}
                        </button>
                    )
                )}
            </div>

            <div className="mt-2.5 flex flex-1 flex-col gap-1">
                <Link href={href} className="line-clamp-2 text-sm font-medium leading-snug text-fg hover:underline underline-offset-2">
                    {product.name}
                </Link>

                {product.numberReviews > 0 ? (
                    <Rating value={product.rating} count={product.numberReviews} />
                ) : (
                    <span className="text-xs text-fg-subtle">No reviews yet</span>
                )}

                <div className="mt-auto pt-1">
                    <div className="flex items-baseline gap-1">
                        {product.fromPrice && <span className="text-xs text-fg-muted">From</span>}
                        <Price value={product.price} listPrice={product.listPrice} size="md" showSaving={false} />
                    </div>
                    <p className="text-xs text-fg-muted">
                        {product.shipping > 0 ? `+$${Number(product.shipping).toFixed(2)} delivery` : "Free delivery"}
                        {product.colors > 1 && <> · {product.colors} colours</>}
                    </p>
                </div>
            </div>
        </article>
    );
};

export default ProductCard;
