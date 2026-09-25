import Link from "next/link";
import Image from "next/image";

import Price from "@/components/shared/Price";
import AddToCartButton from "@/components/shared/AddToCartButton";

// Grocery cards lead with the price and the pack size, the way the aisle pages do,
// rather than with the title the way the rest of the catalog does.
const GroceryCard = ({ product, delivery, priority }: any) => {
    const href = `/product/${product.slug}?style=0`;

    return (
        <article className="w-[200px] shrink-0 flex flex-col">
            <Link href={href} className="block bg-white rounded">
                <div className="relative w-full h-[170px]">
                    {product.image && (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="200px"
                            priority={priority}
                            className="object-contain p-2"
                        />
                    )}
                </div>
            </Link>

            <div className="mt-2">
                <Price
                    value={product.price}
                    listPrice={product.discount > 0 ? product.listPrice : null}
                    discount={product.discount}
                    size="md"
                />
            </div>

            <Link href={href} className="mt-1 text-sm hover:text-accent-deep hover:underline line-clamp-2">
                {product.name}
            </Link>

            {product.unit && <p className="text-xs text-slate-600 mt-1">{product.unit}</p>}

            {product.limitedDeal && (
                <p className="text-xs text-danger font-semibold mt-1">Limited time deal</p>
            )}

            <p className="text-xs mt-1">
                Delivery <span className="font-bold">{delivery}</span>
            </p>

            <div className="mt-auto">
                <AddToCartButton productId={product._id} />
            </div>
        </article>
    );
};

export default GroceryCard;
