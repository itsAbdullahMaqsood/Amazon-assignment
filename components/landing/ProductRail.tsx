import Link from "next/link";

import ProductCard from "@/components/product/ProductCard";
import { SectionHeader } from "@/components/ui/Layout";

// A titled row of product cards: a sideways scroll on phones, a fixed grid on
// desktop. It renders nothing when there is nothing real to show.
const ProductRail = ({ title, description, href, linkLabel = "See all", products = [], limit = 5 }: any) => {
    if (!products.length) {
        return null;
    }

    return (
        <section>
            <SectionHeader
                title={title}
                description={description}
                action={
                    href && (
                        <Link href={href} className="text-link">
                            {linkLabel}
                        </Link>
                    )
                }
            />
            <div className="scroll-row -mx-4 px-4 sm:mx-0 sm:px-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible lg:grid-cols-5">
                {products.slice(0, limit).map((product: any) => (
                    <ProductCard key={product._id} product={product} className="w-40 sm:w-48 md:w-auto" />
                ))}
            </div>
        </section>
    );
};

export default ProductRail;
