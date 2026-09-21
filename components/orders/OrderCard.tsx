import Link from "next/link";
import Image from "next/image";

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

const shortDate = (value: string) =>
    new Date(value).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });

// The bold line above the items: what the shopper is waiting for, or what
// already happened to the order.
const statusLine = (order: any) => {
    if (order.status === "Cancelled") return "Cancelled";
    if (order.status === "Completed" || order.deliveredAt)
        return `Delivered ${shortDate(order.deliveredAt || order.updatedAt)}`;
    if (order.status === "Dispatched") return "Dispatched";
    if (!order.isPaid) return "Payment pending";

    return "Preparing for dispatch";
};

const yellow =
    "px-4 py-1.5 rounded-full text-sm text-center bg-[#FFD814] hover:bg-[#F7CA00] text-black";
const outline =
    "px-4 py-1.5 rounded-full text-sm text-center border border-slate-400 bg-white hover:bg-slate-100 shadow-sm";

// `returnable` is decided on the server: reading the clock during render is
// both impure and a hydration risk on the day a return window closes.
const OrderCard = ({ order, returnable }: any) => {
    const shortId = String(order._id).slice(-12).toUpperCase();

    return (
        <article className="border border-slate-300 rounded-lg overflow-hidden bg-white">
            <div className="bg-[#F0F2F2] border-b border-slate-300 px-4 py-3 flex flex-wrap gap-8 text-xs text-slate-700">
                <div>
                    <p className="uppercase">Order placed</p>
                    <p className="text-sm text-black">{formatDate(order.createdAt)}</p>
                </div>

                <div>
                    <p className="uppercase">Total</p>
                    <p className="text-sm text-black">${Number(order.total).toFixed(2)}</p>
                </div>

                <div>
                    <p className="uppercase">Ship to</p>
                    <p className="text-sm text-[#0F5FA6]">
                        {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                    </p>
                </div>

                <div className="md:ml-auto md:text-right">
                    <p className="uppercase">Order # {shortId}</p>
                    <p className="text-sm">
                        <Link href={`/order/${order._id}`} className="text-[#0F5FA6] hover:text-[#C7511F] hover:underline">
                            View order details
                        </Link>
                        <span className="mx-2 text-slate-400">|</span>
                        <Link href={`/order/${order._id}`} className="text-[#0F5FA6] hover:text-[#C7511F] hover:underline">
                            Invoice
                        </Link>
                    </p>
                </div>
            </div>

            <div className="p-4">
                <p className="font-bold text-lg">{statusLine(order)}</p>

                <div className="mt-4 space-y-6">
                    {order.products.map((line: any, i: number) => {
                        const href = line.product?.slug ? `/product/${line.product.slug}` : "/browse";

                        return (
                            <div key={i} className="flex flex-col md:flex-row gap-4">
                                <Link href={href} className="shrink-0">
                                    <Image
                                        src={line.image}
                                        alt={line.name}
                                        width={96}
                                        height={96}
                                        className="rounded object-contain w-24 h-24 bg-white"
                                    />
                                </Link>

                                <div className="grow min-w-0">
                                    <Link
                                        href={href}
                                        className="text-sm text-[#0F5FA6] hover:text-[#C7511F] hover:underline line-clamp-2"
                                    >
                                        {line.name}
                                    </Link>

                                    <p className="text-xs text-slate-600 mt-1">
                                        {[
                                            line.color?.color && `Colour: ${line.color.color}`,
                                            line.size && `Size: ${line.size}`,
                                            `Qty: ${line.qty}`,
                                        ]
                                            .filter(Boolean)
                                            .join(" · ")}
                                    </p>

                                    <p className="text-sm mt-1">${Number(line.price).toFixed(2)}</p>

                                    <div className="flex flex-wrap gap-4 mt-2 text-xs">
                                        <Link
                                            href={`${href}#customer-reviews`}
                                            className="text-[#0F5FA6] hover:text-[#C7511F] hover:underline"
                                        >
                                            Write a product review
                                        </Link>
                                        <Link
                                            href={`/order/${order._id}`}
                                            className="text-[#0F5FA6] hover:text-[#C7511F] hover:underline"
                                        >
                                            Get product support
                                        </Link>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 w-full md:w-[220px] shrink-0">
                                    <Link href={href} className={yellow}>
                                        Buy it again
                                    </Link>
                                    <Link href={href} className={outline}>
                                        View your item
                                    </Link>
                                    <Link href={`/order/${order._id}`} className={outline}>
                                        Track package
                                    </Link>
                                    {returnable && (
                                        <Link href="/profile/returns" className={outline}>
                                            Return or replace items
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </article>
    );
};

export default OrderCard;
