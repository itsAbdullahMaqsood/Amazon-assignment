import Link from "next/link";
import Image from "next/image";

import Price from "@/components/shared/Price";
import AddToCartButton from "@/components/shared/AddToCartButton";

// The deal tile the Furniture storefront uses: image, then the red deal badge,
// then the price, then the title — Amazon's order on this page, not the catalog's.
const FurnitureCard = ({ product, priority }: any) => {
    const href = `/product/${product.slug}?style=0`;

    return (
        <article className="w-[216px] shrink-0 flex flex-col">
            <Link href={href} className="block">
                <div className="relative w-full h-[216px] rounded-lg overflow-hidden bg-white">
                    {product.image && (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="216px"
                            priority={priority}
                            className="object-contain p-2"
                        />
                    )}
                </div>
            </Link>

            {product.discount > 0 && (
                <p className="mt-2 flex items-center gap-2 text-xs">
                    <span className="bg-danger text-white font-bold rounded-sm px-1.5 py-0.5">
                        {product.discount}% off
                    </span>
                    <span className="text-danger font-semibold">Limited time deal</span>
                </p>
            )}

            <div className="mt-1">
                <Price
                    value={product.price}
                    listPrice={product.discount > 0 ? product.listPrice : null}
                    discount={0}
                    size="md"
                />
            </div>

            <Link
                href={href}
                className="mt-1 text-sm leading-5 hover:text-accent-deep hover:underline line-clamp-2"
            >
                {product.name}
            </Link>

            {product.style && (
                <p className="text-xs text-slate-600 mt-1">
                    {product.style}
                    {product.room ? ` · ${product.room}` : ""}
                </p>
            )}

            <div className="mt-auto pt-2">
                <AddToCartButton productId={product._id} />
            </div>
        </article>
    );
};

export default FurnitureCard;
