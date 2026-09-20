"use client";

import Link from "next/link";
import Image from "next/image";
import { HeartIcon, MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

import { useAppDispatch } from "@/redux/hooks";
import { updateCart } from "@/redux/slices/CartSlice";

const Product = ({ product, selected, setSelected, cartItems }: any) => {
    const dispatch = useAppDispatch();
    const active = Boolean(selected.find((item: any) => item._uid === product._uid));

    const selectHandler = () => {
        if (active) {
            setSelected(selected.filter((item: any) => item._uid !== product._uid));
        } else {
            setSelected([...selected, product]);
        }
    };

    const updateQtyHandler = (type: string) => {
        const apply = (items: any[]) =>
            items.map((item: any) => {
                if (item._uid !== product._uid) {
                    return item;
                }

                return { ...item, qty: type === "plus" ? item.qty + 1 : item.qty - 1 };
            });

        dispatch(updateCart(apply(cartItems)));

        if (active) {
            setSelected(apply(selected));
        }
    };

    const removeHandler = () => {
        dispatch(updateCart(cartItems.filter((item: any) => item._uid !== product._uid)));
        setSelected(selected.filter((item: any) => item._uid !== product._uid));
    };

    const lineTotal = (product.price * product.qty).toFixed(2);
    const lineTotalBefore = (product.priceBefore * product.qty).toFixed(2);

    return (
        <div className="mt-2 grid grid-cols-3 max-md:grid-rows-1 md:grid-cols-6 border-b border-slate-200 p-2 pb-4 last:border-none">
            <div className="flex items-start gap-2">
                <input
                    type="checkbox"
                    checked={active}
                    onChange={selectHandler}
                    className="hidden md:block w-5 h-5 cursor-pointer"
                />

                <Image
                    src={product.images[0].url}
                    alt={product.name}
                    width={100}
                    height={100}
                    className="rounded-md object-cover outline outline-1 outline-offset-2 outline-slate-300"
                />
            </div>

            <div className="col-span-1 md:col-span-4 flex flex-col gap-2 px-2">
                <Link
                    href={`/product/${product.slug}?style=${product.style}`}
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
                    <span className="text-sm">{Number(product.price).toFixed(2)}$</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="font-bold md:text-xl">USD{lineTotal} $</span>

                    {product.discount > 0 && (
                        <span className="text-sm line-through text-slate-400">{lineTotalBefore}$</span>
                    )}
                </div>

                <span className="text-blue-500 text-sm">
                    {product.shipping ? `+${product.shipping}$ shipping fee` : "Free Shipping"}
                </span>

                {product.quantity < product.qty && (
                    <span className="text-red-500 font-semibold text-sm">sold out</span>
                )}
            </div>

            <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={active}
                        onChange={selectHandler}
                        className="md:hidden w-5 h-5 cursor-pointer"
                    />
                    <HeartIcon className="w-6 h-6 cursor-pointer" />
                    <TrashIcon onClick={removeHandler} className="w-6 h-6 cursor-pointer" />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => updateQtyHandler("minus")}
                        disabled={product.qty <= 1}
                        className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                    >
                        <MinusIcon className="w-4 h-4" />
                    </button>

                    <span className="font-semibold">{product.qty}</span>

                    <button
                        onClick={() => updateQtyHandler("plus")}
                        disabled={product.qty >= product.quantity}
                        className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                    >
                        <PlusIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Product;
