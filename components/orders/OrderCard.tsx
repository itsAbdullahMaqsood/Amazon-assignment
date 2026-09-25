import Link from "next/link";
import Image from "next/image";

import { money } from "@/components/ui/Price";
import { buttonClass } from "@/components/ui/Button";
import { formatDate, orderNumber } from "@/lib/returns";
import StatusPill from "./StatusPill";
import BuyAgainButton from "./BuyAgainButton";

// One order at a glance: what state it's in, what's in it, what it cost, and
// the two or three things you can do next.
const OrderCard = ({ order }: any) => {
    const lines = order.lines || [];
    const shown = lines.slice(0, 4);
    const returnable = lines.some((line: any) => line.returns.returnable);
    const items = lines.reduce((sum: number, line: any) => sum + (line.qty || 0), 0);
    const dateLine =
        order.status === "Completed" && order.deliveredAt
            ? `Delivered ${formatDate(order.deliveredAt)}`
            : order.status === "Cancelled"
              ? `Cancelled · placed ${formatDate(order.createdAt)}`
              : `Placed ${formatDate(order.createdAt)}`;

    return (
        <article className="rounded-panel border border-line bg-surface">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-5">
                <div className="flex flex-wrap items-center gap-3">
                    <StatusPill state={order.state} />
                    <span className="text-sm text-fg-muted">{dateLine}</span>
                </div>
                <span className="text-xs text-fg-subtle tabular">#{orderNumber(order._id)}</span>
            </div>

            <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:p-5">
                <ul className="flex min-w-0 flex-1 flex-col gap-3">
                    {shown.map((line: any) => (
                        <li key={line.index} className="flex items-center gap-3">
                            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-control bg-surface-muted">
                                {line.image && <Image src={line.image} alt="" fill sizes="56px" className="object-contain p-1" />}
                            </span>
                            <div className="min-w-0">
                                {line.slug ? (
                                    <Link href={`/product/${line.slug}`} className="line-clamp-1 text-sm font-medium hover:underline">
                                        {line.name}
                                    </Link>
                                ) : (
                                    <p className="line-clamp-1 text-sm font-medium">{line.name}</p>
                                )}
                                <p className="text-xs text-fg-muted">
                                    Qty {line.qty}
                                    {line.requests.length > 0 && <> · {line.requests[line.requests.length - 1].status}</>}
                                </p>
                            </div>
                        </li>
                    ))}
                    {lines.length > shown.length && (
                        <li className="text-sm text-fg-muted">
                            and {lines.length - shown.length} more item{lines.length - shown.length === 1 ? "" : "s"}
                        </li>
                    )}
                </ul>

                <div className="flex shrink-0 flex-col gap-3 md:w-52 md:items-stretch">
                    <p className="text-sm text-fg-muted md:text-right">
                        {items} item{items === 1 ? "" : "s"} · <span className="font-semibold text-fg tabular">{money(order.total)}</span>
                    </p>
                    <div className="flex flex-wrap gap-2 md:flex-col">
                        <Link href={`/order/${order._id}`} className={buttonClass({ variant: "secondary", size: "sm" })}>
                            View order
                        </Link>
                        {returnable && (
                            <Link href={`/order/${order._id}#items`} className={buttonClass({ variant: "outline", size: "sm" })}>
                                Return items
                            </Link>
                        )}
                        {order.status !== "Cancelled" && <BuyAgainButton lines={lines} />}
                    </div>
                </div>
            </div>
        </article>
    );
};

export default OrderCard;
