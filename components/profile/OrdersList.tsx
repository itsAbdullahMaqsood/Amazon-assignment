import Link from "next/link";
import Image from "next/image";

const filters = [
    { label: "All orders", value: "" },
    { label: "Paid", value: "paid" },
    { label: "Unpaid", value: "unpaid" },
    { label: "Not Processed", value: "Not Processed" },
    { label: "Processing", value: "Processing" },
    { label: "Dispatched", value: "Dispatched" },
    { label: "Cancelled", value: "Cancelled" },
    { label: "Completed", value: "Completed" },
];

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

const OrdersList = ({ orders, active, search }: any) => {
    return (
        <div>
            {search && (
                <p className="mb-4 text-sm">
                    Showing orders matching{" "}
                    <span className="font-semibold">&quot;{search}&quot;</span>{" "}
                    <Link href="/profile/orders" className="text-[#0F5FA6] hover:underline">
                        clear
                    </Link>
                </p>
            )}

            <div className="flex flex-wrap gap-2 mb-6">
                {filters.map((filter) => (
                    <Link
                        key={filter.label}
                        href={filter.value ? `/profile/orders?filter=${encodeURIComponent(filter.value)}` : "/profile/orders"}
                        aria-current={active === filter.value ? "page" : undefined}
                        className={`px-4 py-1.5 rounded-full border text-sm ${
                            active === filter.value
                                ? "bg-amazon-blue_light text-white border-amazon-blue_light"
                                : "bg-white border-slate-300 hover:bg-slate-100"
                        }`}
                    >
                        {filter.label}
                    </Link>
                ))}
            </div>

            {orders.length === 0 ? (
                <div className="bg-white border border-slate-300 rounded-lg p-8 text-center">
                    <p className="font-semibold">No orders here yet.</p>
                    <Link
                        href="/browse"
                        className="inline-block mt-4 px-6 py-2 rounded-full bg-linear-to-r from-amazon-orange to-yellow-300 text-amazon-blue_dark"
                    >
                        Start shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order: any) => (
                        <article key={order._id} className="border border-slate-300 rounded-lg overflow-hidden">
                            <div className="bg-slate-100 px-4 py-3 flex flex-wrap gap-6 text-xs text-slate-600">
                                <div>
                                    <p className="uppercase">Order placed</p>
                                    <p className="text-sm text-black">{formatDate(order.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="uppercase">Total</p>
                                    <p className="text-sm text-black">{order.total}$</p>
                                </div>
                                <div>
                                    <p className="uppercase">Ship to</p>
                                    <p className="text-sm text-black">
                                        {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                                    </p>
                                </div>

                                <div className="md:ml-auto md:text-right">
                                    <p className="uppercase">Order # {order._id}</p>
                                    <p className="text-sm">
                                        <Link href={`/order/${order._id}`} className="text-[#0F5FA6] hover:underline">
                                            View order details
                                        </Link>
                                        <span className="mx-2 text-slate-400">|</span>
                                        <Link href={`/order/${order._id}`} className="text-[#0F5FA6] hover:underline">
                                            Invoice
                                        </Link>
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 space-y-4">
                                <p className="font-bold">
                                    {order.isPaid ? "Paid" : "Payment pending"} · {order.status}
                                </p>

                                {order.products.map((line: any, i: number) => (
                                    <div key={i} className="flex gap-4">
                                        <Image
                                            src={line.image}
                                            alt={line.name}
                                            width={80}
                                            height={80}
                                            className="rounded object-cover w-20 h-20"
                                        />

                                        <div className="flex-1">
                                            <Link
                                                href={`/product/${line.product?.slug || ""}`}
                                                className="text-[#0F5FA6] hover:underline text-sm font-semibold"
                                            >
                                                {line.name}
                                            </Link>
                                            <p className="text-xs text-slate-600 mt-1">
                                                Colour: {line.color?.color} · Size: {line.size} · Qty: {line.qty}
                                            </p>
                                            <p className="text-sm mt-1">{line.price}$</p>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Link
                                                href={`/product/${line.product?.slug || ""}`}
                                                className="px-4 py-1.5 rounded-full text-sm bg-linear-to-r from-amazon-orange to-yellow-300 text-amazon-blue_dark text-center"
                                            >
                                                Buy it again
                                            </Link>
                                            <Link
                                                href={`/product/${line.product?.slug || ""}`}
                                                className="px-4 py-1.5 rounded-full text-sm border border-slate-300 text-center hover:bg-slate-100"
                                            >
                                                View your item
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersList;
