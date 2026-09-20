import Link from "next/link";
import Image from "next/image";

const GridCategory = ({ category, products, gridCols }: any) => {
    const tiles = products
        .filter((product: any) => product.category?.slug === category)
        .slice(0, gridCols * gridCols);

    // Written out literally: Tailwind cannot see interpolated class names.
    const gridClass = gridCols === 2 ? "grid-cols-2" : "grid-cols-1";
    const single = gridCols === 1;

    return (
        <div className="bg-white border border-gray-200 rounded p-2 flex flex-col">
            <h3 className="uppercase font-bold mb-2">{category.replace(/-/g, " ")}</h3>

            <div className={`grid ${gridClass} gap-2 grow`}>
                {tiles.map((product: any) => (
                    <Link key={product._id} href={`/product/${product.slug}`}>
                        <div className={`relative ${single ? "h-[420px]" : "h-[200px]"}`}>
                            <Image
                                src={product.subProducts?.[0]?.images?.[0]?.url}
                                alt={product.name}
                                fill
                                className="object-cover rounded"
                            />
                        </div>
                        {!single && <p className="text-xs mt-1 line-clamp-1">{product.name}</p>}
                    </Link>
                ))}
            </div>

            <Link href="/browse" className="text-xs text-blue-500 hover:underline mt-2">
                {single ? "Shop now" : "See more"}
            </Link>
        </div>
    );
};

export default GridCategory;
