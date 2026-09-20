import GroceryCard from "./GroceryCard";

const GroceryGrid = ({ title, products, delivery }: any) => {
    return (
        <section className="mt-6">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-slate-600 mt-1">
                {products.length} {products.length === 1 ? "result" : "results"}
            </p>

            <div className="mt-4 flex flex-wrap gap-4">
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

export default GroceryGrid;
