import KeepShoppingCard from "./KeepShoppingCard";

const ProductGrid = ({ products, delivery, sponsoredId }: any) => {
    if (!products.length) {
        return (
            <p className="py-10 text-center text-slate-600">
                No results for these filters. Widen the price range or lower the rating.
            </p>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-2">
            {products.map((product: any) => (
                <KeepShoppingCard
                    key={product._id}
                    product={product}
                    delivery={delivery}
                    sponsored={product._id === sponsoredId}
                />
            ))}
        </div>
    );
};

export default ProductGrid;
