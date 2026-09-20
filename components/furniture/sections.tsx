import Link from "next/link";

import FurnitureCard from "./FurnitureCard";
import { brands } from "@/lib/furniture";

// "Featured deals": one scrolling row of the discounted end of the store, with
// the "Shop all" link the storefront puts beside the heading.
export const FeaturedDeals = ({ products, href }: any) => {
    if (!products?.length) {
        return null;
    }

    return (
        <section className="mt-10">
            <div className="flex items-baseline gap-3">
                <h3 className="text-2xl font-bold text-[#0f1111]">Featured deals</h3>

                <Link href={href} className="text-sm text-[#007185] hover:underline">
                    Shop all
                </Link>
            </div>

            <div className="mt-3 flex gap-[18px] overflow-x-auto scrollbar-hide">
                {products.map((product: any, index: number) => (
                    <FurnitureCard
                        key={product._id}
                        product={product}
                        // The first row of images is above the fold; Next then
                        // loads them eagerly instead of warning about the LCP.
                        priority={index < 5}
                    />
                ))}
            </div>
        </section>
    );
};

// Partner names stay as plain text wordmarks rather than reproduced logos.
export const BrandStrip = () => (
    <section className="mt-12">
        <h2 className="text-2xl font-bold text-[#0f1111]">Shop popular brands</h2>

        <ul className="mt-4 flex items-center gap-10 overflow-x-auto scrollbar-hide pb-2">
            {brands.map((brand) => (
                <li key={brand} className="shrink-0">
                    <Link
                        href={`/browse?brand=${encodeURIComponent(brand)}`}
                        className="text-xl md:text-2xl font-semibold tracking-tight text-[#0f1111] hover:text-[#C7511F] whitespace-nowrap"
                    >
                        {brand}
                    </Link>
                </li>
            ))}
        </ul>
    </section>
);

// What a room or style tile opens: the same store, filtered, with a crumb back.
export const ResultsGrid = ({ title, products }: any) => (
    <section className="mt-6">
        <nav className="text-sm text-[#007185]">
            <Link href="/furniture" className="hover:underline hover:text-[#C7511F]">
                Furniture
            </Link>
            <span className="text-[#0f1111]"> › {title}</span>
        </nav>

        <h1 className="mt-2 text-2xl font-bold text-[#0f1111]">{title}</h1>
        <p className="text-sm text-slate-600 mt-1">
            {products.length} {products.length === 1 ? "result" : "results"}
        </p>

        {products.length === 0 && (
            <p className="mt-6 text-sm">
                Nothing in this store carries that tag yet.{" "}
                <Link href="/furniture" className="text-[#007185] hover:underline">
                    Back to Furniture
                </Link>
            </p>
        )}

        <div className="mt-4 flex flex-wrap gap-[18px]">
            {products.map((product: any, index: number) => (
                <FurnitureCard key={product._id} product={product} priority={index < 5} />
            ))}
        </div>
    </section>
);

export const Unstocked = () => (
    <div className="max-w-2xl mx-auto my-24 px-6 text-center">
        <p className="text-lg">The furniture store has not been stocked yet.</p>
        <p className="mt-4 text-sm text-slate-600">
            The furniture catalog is seeded separately: run <code>npm run seed:furniture</code>.
        </p>
    </div>
);
