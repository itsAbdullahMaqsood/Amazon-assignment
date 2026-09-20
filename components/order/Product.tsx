import Link from "next/link";
import Image from "next/image";

const Product = ({ product }: any) => {
    return (
        <div className="mt-2 grid grid-cols-3 max-md:grid-rows-1 md:grid-cols-6 border-b border-slate-200 p-2 pb-4">
            <Image
                src={product.image}
                alt={product.name}
                width={100}
                height={100}
                className="rounded-md object-cover outline outline-1 outline-offset-2 outline-slate-300"
            />

            <div className="col-span-2 md:col-span-5 flex flex-col gap-2 px-2">
                <Link
                    href={`/product/${product.product?.slug || ""}`}
                    className="text-sm font-semibold hover:underline"
                >
                    {product.name}
                </Link>

                <div className="w-fit flex items-center space-x-3 px-3 py-2 bg-slate-100 rounded-full">
                    {product.color?.image ? (
                        <Image
                            src={product.color.image}
                            alt=""
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                        />
                    ) : (
                        <span
                            className="block w-10 h-10 rounded-full"
                            style={{ backgroundColor: product.color?.color }}
                        />
                    )}

                    <span className="text-sm">{product.size}</span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm">
                        {Number(product.price).toFixed(2)}$ x {product.qty}
                    </span>
                    <span className="font-bold">
                        {(product.price * product.qty).toFixed(2)} $
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Product;
