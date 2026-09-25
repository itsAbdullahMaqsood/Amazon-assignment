import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import connectDb from "@/lib/db";
import { requireAdminPage } from "@/lib/guard";
import { formatDate, itemCount, shortId } from "@/lib/adminOrders";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import Price from "@/components/shared/Price";
import { Panel, table } from "@/components/admin/ui";
import OrderStatusPanel from "@/components/admin/orders/OrderStatusPanel";
import { paymentMethods } from "@/components/checkoutPage/payment/paymentMethods";

// Shared by generateMetadata and the page, so the order is read once and an
// unknown id is known before anything streams.
const getOrder = cache(async (id: string) => {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }

    await connectDb();

    const order = await Order.findById(id)
        .populate({ path: "user", model: User, select: "name email" })
        .populate({ path: "products.product", model: Product, select: "slug" })
        .lean();

    return order ? JSON.parse(JSON.stringify(order)) : null;
});

export const generateMetadata = async ({ params }: any) => {
    const { id } = await params;

    await requireAdminPage(`/admin/dashboard/orders/${id}`);

    const order = await getOrder(id);

    if (!order) {
        notFound();
    }

    return { title: `Order ${shortId(id)}` };
};

const Row = ({ term, children }: any) => (
    <div className="flex justify-between gap-4 py-1.5">
        <dt className="text-slate-600">{term}</dt>
        <dd className="text-right">{children}</dd>
    </div>
);

const Page = async ({ params }: any) => {
    const { id } = await params;

    await requireAdminPage(`/admin/dashboard/orders/${id}`);

    const order = await getOrder(id);

    if (!order) {
        notFound();
    }

    const address = order.shippingAddress || {};
    const method = paymentMethods.find((m) => m.id === order.paymentMethod);
    const subtotal = order.totalBeforeDiscount ?? order.products.reduce((s: number, l: any) => s + l.price * l.qty, 0);
    const giftCard = Number(order.giftCardApplied || 0);
    // What the coupon took: everything between the subtotal and the total that
    // the gift card and shipping do not explain.
    const couponSaving = order.couponApplied
        ? Math.max(0, subtotal + Number(order.shippingPrice || 0) + Number(order.taxPrice || 0) - giftCard - order.total)
        : 0;

    const timeline = [
        { label: "Placed", at: order.createdAt },
        { label: "Paid", at: order.paidAt },
        { label: order.status === "Cancelled" ? "Cancelled" : null, at: order.status === "Cancelled" ? order.updatedAt : null },
        { label: "Delivered", at: order.deliveredAt },
    ].filter((step) => step.label && step.at);

    return (
        <>
            <Link
                href="/admin/dashboard/orders"
                className="inline-flex items-center gap-1 text-sm text-accent-ink hover:text-accent-deep hover:underline rounded outline-none focus-visible:ring-2 focus-visible:ring-accent-ink mb-3"
            >
                <ArrowLeftIcon className="w-4 h-4" />
                All orders
            </Link>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-fg">
                    Order <span className="font-mono">{shortId(order._id)}</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-mono break-all">{order._id}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="lg:col-span-2 space-y-4 lg:space-y-6 min-w-0">
                    <Panel title={`Items (${itemCount(order)})`}>
                        <div className={`${table.wrap} -m-5 rounded-none border-0`}>
                            <table className={table.table}>
                                <caption className="sr-only">Items in this order</caption>
                                <thead className={table.head}>
                                    <tr>
                                        <th scope="col" className={table.th}>Product</th>
                                        <th scope="col" className={table.th}>Size</th>
                                        <th scope="col" className={table.th}>Colour</th>
                                        <th scope="col" className={`${table.th} text-right`}>Qty</th>
                                        <th scope="col" className={`${table.th} text-right`}>Price</th>
                                        <th scope="col" className={`${table.th} text-right`}>Line total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.products.map((line: any, i: number) => (
                                        <tr key={line._id || i} className={table.row}>
                                            <td className={table.td}>
                                                <div className="flex items-center gap-3 min-w-56">
                                                    {line.image && (
                                                        <Image
                                                            src={line.image}
                                                            alt=""
                                                            width={48}
                                                            height={48}
                                                            className="w-12 h-12 rounded-md object-cover border border-slate-200 shrink-0"
                                                        />
                                                    )}
                                                    {line.product?.slug ? (
                                                        <Link
                                                            href={`/product/${line.product.slug}`}
                                                            className="text-accent-ink hover:text-accent-deep hover:underline rounded outline-none focus-visible:ring-2 focus-visible:ring-accent-ink line-clamp-2"
                                                        >
                                                            {line.name}
                                                        </Link>
                                                    ) : (
                                                        <span className="line-clamp-2">{line.name}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className={`${table.td} whitespace-nowrap`}>{line.size || "—"}</td>
                                            <td className={table.td}>
                                                {line.color?.image ? (
                                                    <Image
                                                        src={line.color.image}
                                                        alt={line.color?.color || "Colour swatch"}
                                                        width={24}
                                                        height={24}
                                                        className="w-6 h-6 rounded-full object-cover border border-slate-200"
                                                    />
                                                ) : line.color?.color ? (
                                                    <span className="inline-flex items-center gap-2">
                                                        <span
                                                            className="w-5 h-5 rounded-full border border-slate-300"
                                                            style={{ backgroundColor: line.color.color }}
                                                        />
                                                        <span className="font-mono text-xs text-slate-600">{line.color.color}</span>
                                                    </span>
                                                ) : (
                                                    "—"
                                                )}
                                            </td>
                                            <td className={`${table.td} text-right tabular-nums`}>{line.qty}</td>
                                            <td className={`${table.td} text-right whitespace-nowrap`}>
                                                <Price value={line.price} size="sm" />
                                            </td>
                                            <td className={`${table.td} text-right whitespace-nowrap`}>
                                                <Price value={line.price * line.qty} size="sm" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Panel>

                    <Panel title="Totals">
                        <dl className="text-sm max-w-sm ml-auto">
                            <Row term="Subtotal">
                                <Price value={subtotal} size="sm" />
                            </Row>
                            {order.couponApplied && (
                                <Row term={`Coupon (${order.couponApplied})`}>
                                    <span className="text-danger">
                                        −<Price value={couponSaving} size="sm" />
                                    </span>
                                </Row>
                            )}
                            {giftCard > 0 && (
                                <Row term="Gift card">
                                    <span className="text-danger">
                                        −<Price value={giftCard} size="sm" />
                                    </span>
                                </Row>
                            )}
                            {Number(order.shippingPrice) > 0 && (
                                <Row term="Shipping">
                                    <Price value={order.shippingPrice} size="sm" />
                                </Row>
                            )}
                            {Number(order.taxPrice) > 0 && (
                                <Row term="Tax">
                                    <Price value={order.taxPrice} size="sm" />
                                </Row>
                            )}
                            <div className="flex justify-between gap-4 pt-3 mt-2 border-t border-slate-200 font-semibold">
                                <dt>Order total</dt>
                                <dd>
                                    <Price value={order.total} size="md" />
                                </dd>
                            </div>
                        </dl>
                    </Panel>
                </div>

                <div className="space-y-4 lg:space-y-6 min-w-0">
                    <OrderStatusPanel key={order.updatedAt} order={order} />

                    <Panel title="Timeline">
                        <ol className="relative border-l border-slate-200 ml-1.5 space-y-4">
                            {timeline.map((step) => (
                                <li key={step.label} className="pl-4">
                                    <span className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-accent-ink ring-4 ring-white" />
                                    <p className="text-sm font-medium text-fg">{step.label}</p>
                                    <p className="text-xs text-slate-600">{formatDate(step.at, true)}</p>
                                </li>
                            ))}
                        </ol>
                    </Panel>

                    <Panel title="Customer">
                        {order.user ? (
                            <div className="text-sm">
                                <p className="font-medium text-fg">{order.user.name}</p>
                                <a
                                    href={`mailto:${order.user.email}`}
                                    className="text-accent-ink hover:underline break-all rounded outline-none focus-visible:ring-2 focus-visible:ring-accent-ink"
                                >
                                    {order.user.email}
                                </a>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">This account has been deleted.</p>
                        )}
                    </Panel>

                    <Panel title="Shipping address">
                        <address className="not-italic text-sm text-slate-700 leading-6">
                            <span className="font-medium text-fg">
                                {[address.firstName, address.lastName].filter(Boolean).join(" ")}
                            </span>
                            <br />
                            {address.address1}
                            {address.address2 && (
                                <>
                                    <br />
                                    {address.address2}
                                </>
                            )}
                            <br />
                            {[address.city, address.state, address.zipCode].filter(Boolean).join(", ")}
                            <br />
                            {address.country}
                            {address.phoneNumber && (
                                <>
                                    <br />
                                    Phone: {address.phoneNumber}
                                </>
                            )}
                        </address>
                    </Panel>

                    <Panel title="Payment">
                        <dl className="text-sm">
                            <Row term="Method">{method?.name || order.paymentMethod || "—"}</Row>
                            <Row term="Transaction">
                                {order.paymentResult?.id ? (
                                    <span className="font-mono text-xs break-all">{order.paymentResult.id}</span>
                                ) : (
                                    <span className="text-slate-500">Not paid</span>
                                )}
                            </Row>
                            {order.paymentResult?.status && <Row term="Result">{order.paymentResult.status}</Row>}
                        </dl>
                    </Panel>
                </div>
            </div>
        </>
    );
};

export default Page;
