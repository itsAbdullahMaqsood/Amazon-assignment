import Link from "next/link";

import GroceryCard from "./GroceryCard";

const GroceryRow = ({ title, products, delivery, href }: any) => {
    if (!products?.length) {
        return null;
    }

    return (
        <section className="mt-8">
            <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-xl md:text-2xl font-bold">{title}</h2>

                {href && (
                    <Link href={href} className="text-sm text-accent-ink hover:underline shrink-0">
                        See more ›
                    </Link>
                )}
            </div>

            <div className="mt-3 flex gap-4 overflow-x-auto scrollbar-hide">
                {products.map((product: any, index: number) => (
                    <GroceryCard
                        key={product._id}
                        product={product}
                        delivery={delivery}
                        // The first row of images is above the fold; Next then
                        // loads them eagerly instead of warning about the LCP.
                        priority={index < 6}
                    />
                ))}
            </div>
        </section>
    );
};

export default GroceryRow;
