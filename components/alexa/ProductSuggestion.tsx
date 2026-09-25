import Link from "next/link";
import Image from "next/image";

import StarRating from "@/components/shared/StarRating";
import Price from "@/components/shared/Price";
import AddToCartButton from "@/components/shared/AddToCartButton";

const soldLine = (sold: number) => {
    if (sold >= 1000) return `${Math.round(sold / 1000)}K+ bought in past month`;
    if (sold >= 100) return `${Math.floor(sold / 100) * 100}+ bought in past month`;
    return "";
};

const ProductSuggestion = ({ product, delivery }: any) => {
    return (
        <article className="border border-slate-200 rounded-lg bg-white flex overflow-hidden">
            <Link
                href={`/product/${product.slug}`}
                className="w-[110px] shrink-0 bg-slate-50 relative"
            >
                {product.image && (
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="110px"
                        className="object-contain p-2"
                    />
                )}
            </Link>

            <div className="flex-1 p-3">
                <Link href={`/product/${product.slug}`} className="font-medium leading-snug hover:underline">
                    {product.name}
                </Link>

                {product.numberReviews > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-sm">{product.rating.toFixed(1)}</span>
                        <StarRating value={product.rating} size="w-4 h-4" />
                        <span className="text-sm text-slate-600">
                            ({product.numberReviews.toLocaleString()})
                        </span>
                    </div>
                )}

                {soldLine(product.sold) && (
                    <p className="text-sm text-slate-600 mt-0.5">{soldLine(product.sold)}</p>
                )}

                <div className="mt-1">
                    <Price
                        value={product.price}
                        listPrice={product.discount > 0 ? product.listPrice : null}
                        discount={product.discount}
                        size="md"
                    />
                </div>

                <p className="text-sm mt-1">
                    FREE delivery <span className="font-bold">{delivery}</span> on $35.00 of items
                    shipped by Markaz
                </p>

                <AddToCartButton productId={product._id} />
            </div>
        </article>
    );
};

export default ProductSuggestion;
