import Link from "next/link";
import Image from "next/image";

const Product = ({ cart }: any) => {
    return (
        <div className="mt-8">
            <div className="flex items-center justify-between pb-2 mb-4 border-b-2 border-slate-200">
                <h2 className="text-xl font-semibold">Cart</h2>
                <span className="text-sm text-slate-600">{cart.products.length} item(s)</span>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {cart.products.map((product: any, i: number) => (
                    <div
                        key={i}
                        className="p-1.5 flex md:flex-col outline outline-1 outline-offset-1 outline-slate-300 rounded-md"
                    >
                        <Link
                            href={`/product/${product.product?.slug || ""}`}
                            target="_blank"
                            className="relative w-[200px] h-[220px] max-w-full"
                        >
                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                        </Link>

                        <div className="flex items-center gap-2 bg-slate-100 rounded-full px-2 py-1 my-2 w-fit">
                            {product.color?.image ? (
                                <Image
                                    src={product.color.image}
                                    alt=""
                                    width={30}
                                    height={30}
                                    className="rounded-full object-cover"
                                />
                            ) : (
                                <span
                                    className="block w-[30px] h-[30px] rounded-full"
                                    style={{ backgroundColor: product.color?.color }}
                                />
                            )}

                            <span className="text-xs">{product.size}</span>
                            <span className="text-xs">X{product.qty}</span>
                        </div>

                        <p className="text-xs font-semibold">
                            {product.name.length > 18 ? `${product.name.slice(0, 18)}...` : product.name}
                        </p>

                        <span className="text-sm">{(product.price * product.qty).toFixed(2)}$</span>
                    </div>
                ))}
            </div>

            <div className="border-t border-slate-200 mt-4 pt-2 text-right">
                Subtotal: <span className="font-bold">{cart.cartTotal}$</span>
            </div>
        </div>
    );
};

export default Product;
