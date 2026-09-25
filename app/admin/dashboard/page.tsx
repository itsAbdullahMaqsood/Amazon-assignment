import Link from "next/link";
import {
    BanknotesIcon,
    ClipboardDocumentListIcon,
    CubeIcon,
    ExclamationTriangleIcon,
    UsersIcon,
} from "@heroicons/react/24/outline";

import connectDb from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { requireAdminPage } from "@/lib/guard";
import { Badge, EmptyState, PageHeader, Panel, statusTone } from "@/components/admin/ui";
import Price from "@/components/shared/Price";

export const metadata = { title: "Dashboard" };

const LOW_STOCK = 5;
const DAYS = 30;

const money = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// Revenue is paid orders that were not cancelled: a cancelled paid order had its
// stock restored and is treated as refunded.
const Page = async () => {
    await requireAdminPage("/admin/dashboard");
    await connectDb();

    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (DAYS - 1));

    const paid = { isPaid: true, status: { $ne: "Cancelled" } };

    const [revenue, orderCount, productCount, userCount, byDay, latest, products] = await Promise.all([
        Order.aggregate([{ $match: paid }, { $group: { _id: null, total: { $sum: "$total" } } }]),
        Order.countDocuments(),
        Product.countDocuments(),
        User.countDocuments(),
        Order.aggregate([
            { $match: { ...paid, paidAt: { $gte: since } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } }, total: { $sum: "$total" }, count: { $sum: 1 } } },
        ]),
        Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate({ path: "user", model: User, select: "name email" })
            .select("total status isPaid createdAt user")
            .lean(),
        Product.find({ "subProducts.sizes.qty": { $lte: LOW_STOCK } })
            .select("name slug subProducts")
            .lean(),
    ]);

    // One entry per variant with any size at or below the threshold.
    const lowStock = products
        .flatMap((p: any) =>
            p.subProducts.map((sub: any, style: number) => ({
                id: String(p._id),
                name: p.name,
                style,
                color: sub.color?.color,
                sizes: sub.sizes.filter((row: any) => row.qty <= LOW_STOCK),
            }))
        )
        .filter((entry: any) => entry.sizes.length)
        .sort((a: any, b: any) => Math.min(...a.sizes.map((s: any) => s.qty)) - Math.min(...b.sizes.map((s: any) => s.qty)));

    // Every day of the window is present, including days with no sales.
    const totals = new Map(byDay.map((d: any) => [d._id, d.total]));
    const days = Array.from({ length: DAYS }, (_, i) => {
        const date = new Date(since);
        date.setUTCDate(since.getUTCDate() + i);
        const key = date.toISOString().slice(0, 10);

        return { key, total: Number(totals.get(key) || 0) };
    });
    const peak = Math.max(1, ...days.map((d) => d.total));
    const windowTotal = days.reduce((sum, d) => sum + d.total, 0);

    const stats = [
        { label: "Revenue", value: money(revenue[0]?.total || 0), note: "paid, not cancelled", icon: BanknotesIcon, href: "/admin/dashboard/orders?paid=paid" },
        { label: "Orders", value: orderCount, note: "all time", icon: ClipboardDocumentListIcon, href: "/admin/dashboard/orders" },
        { label: "Products", value: productCount, note: "in the catalogue", icon: CubeIcon, href: "/admin/dashboard/product" },
        { label: "Customers", value: userCount, note: "accounts", icon: UsersIcon, href: "/admin/dashboard/users" },
        { label: "Low stock", value: lowStock.length, note: `variants at ≤ ${LOW_STOCK}`, icon: ExclamationTriangleIcon, href: "#low-stock", warn: lowStock.length > 0 },
    ];

    const W = 720;
    const H = 180;
    const bar = W / DAYS;

    return (
        <>
            <PageHeader title="Dashboard" description="Live figures from the store's database." />

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-accent-ink"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">{stat.label}</span>
                            <stat.icon className={`w-5 h-5 ${stat.warn ? "text-amber-600" : "text-slate-400"}`} />
                        </div>
                        <p className="text-2xl font-bold mt-2 text-fg">{stat.value}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{stat.note}</p>
                    </Link>
                ))}
            </div>

            <Panel title={`Revenue, last ${DAYS} days`} action={<span className="text-sm font-semibold">{money(windowTotal)}</span>} className="mb-6">
                <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full h-auto" role="img" aria-label={`Daily revenue for the last ${DAYS} days, ${money(windowTotal)} in total`}>
                    {[0.25, 0.5, 0.75, 1].map((f) => (
                        <line key={f} x1={0} x2={W} y1={H - H * f} y2={H - H * f} stroke="#e2e8f0" strokeDasharray="4 4" />
                    ))}
                    {days.map((d, i) => {
                        const h = (d.total / peak) * (H - 8);

                        return (
                            <g key={d.key}>
                                <rect x={i * bar + 3} y={H - h} width={bar - 6} height={Math.max(h, d.total ? 2 : 0)} rx={3} fill="#febd69">
                                    <title>{`${d.key}: ${money(d.total)}`}</title>
                                </rect>
                                {i % 5 === 0 && (
                                    <text x={i * bar + bar / 2} y={H + 16} textAnchor="middle" fontSize="11" fill="#64748b">
                                        {d.key.slice(5)}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </Panel>

            <div className="grid lg:grid-cols-2 gap-6">
                <Panel title="Latest orders" action={<Link href="/admin/dashboard/orders" className="text-sm text-accent-ink hover:underline">View all</Link>}>
                    {latest.length === 0 ? (
                        <EmptyState title="No orders yet" />
                    ) : (
                        <ul className="divide-y divide-slate-100 -my-2">
                            {latest.map((order: any) => (
                                <li key={String(order._id)}>
                                    <Link href={`/admin/dashboard/orders/${order._id}`} className="flex items-center gap-3 py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium truncate">{order.user?.name || "Deleted account"}</p>
                                            <p className="text-xs text-slate-500 font-mono">#{String(order._id).slice(-8).toUpperCase()}</p>
                                        </div>
                                        <Badge tone={statusTone[order.status]}>{order.status}</Badge>
                                        <Price value={order.total} size="sm" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>

                <div id="low-stock">
                    <Panel title="Low stock">
                        {lowStock.length === 0 ? (
                            <EmptyState title="Nothing is running low" />
                        ) : (
                            <ul className="divide-y divide-slate-100 -my-2">
                                {lowStock.slice(0, 8).map((entry: any) => (
                                    <li key={`${entry.id}-${entry.style}`}>
                                        <Link href={`/admin/dashboard/product/${entry.id}/edit?style=${entry.style}`} className="flex items-center gap-3 py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg">
                                            <span aria-hidden="true" className="w-4 h-4 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: entry.color }} />
                                            <p className="text-sm flex-1 min-w-0 truncate">{entry.name}</p>
                                            <span className="text-xs text-slate-600 whitespace-nowrap">
                                                {entry.sizes.map((s: any) => `${s.size}: ${s.qty}`).join(" · ")}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Panel>
                </div>
            </div>
        </>
    );
};

export default Page;
