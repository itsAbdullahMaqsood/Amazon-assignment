import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/models/Order";
import { Notice, PageHeader } from "@/components/ui/Layout";
import { formatDate } from "@/lib/returns";

export const metadata = { title: "Product recalls" };

// Amazon checks what you have bought against recall notices. Markaz subscribes
// to no recall feed, so the page does not claim to have checked anything: it
// lists exactly what it would check, and says where a real notice would come
// from.
const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/recalls");
    }

    await connectDb();

    const orders: any[] = await Order.find({ user: session.user.id })
        .select("products createdAt")
        .sort({ createdAt: -1 })
        .lean();

    const seen = new Map<string, any>();

    for (const order of orders) {
        for (const line of order.products || []) {
            const key = `${line.name}-${line.size || ""}`;

            if (!seen.has(key)) {
                seen.set(key, { ...line, orderedAt: order.createdAt });
            }
        }
    }

    const items = [...seen.values()];

    return (
        <>
            <PageHeader
                title="Product recalls"
                description="What Markaz would check, if it had anything to check against."
            />

            <Notice tone="neutral" title="Nothing is flagged, and nothing has been checked">
                <p>
                    Markaz does not subscribe to a safety-notice feed, so no product here has been matched against
                    one. This page is the list it would check — everything you have ordered — and it will stay
                    empty of alerts until such a feed exists.
                </p>
                <p className="mt-2">
                    For real notices, the US Consumer Product Safety Commission publishes them at{" "}
                    <a href="https://www.cpsc.gov/Recalls" target="_blank" rel="noreferrer" className="text-link">
                        cpsc.gov/Recalls
                    </a>
                    , and the FDA publishes drug and food recalls of its own.
                </p>
            </Notice>

            {items.length > 0 ? (
                <section className="mt-8">
                    <h2 className="font-display text-lg font-semibold text-fg">
                        The {items.length} item{items.length === 1 ? "" : "s"} you have ordered
                    </h2>

                    <ul className="mt-3 divide-y divide-line rounded-card border border-line bg-surface">
                        {items.map((item: any, i: number) => (
                            <li key={i} className="flex items-center gap-4 px-4 py-3">
                                {item.image && (
                                    <Image
                                        src={item.image}
                                        alt=""
                                        width={56}
                                        height={56}
                                        className="h-14 w-14 rounded-control bg-surface-muted object-contain p-1"
                                    />
                                )}

                                <span className="min-w-0">
                                    <span className="line-clamp-2 block text-sm text-fg">{item.name}</span>
                                    <span className="mt-0.5 block text-xs text-fg-muted">
                                        Ordered {formatDate(item.orderedAt)}
                                        {item.size ? ` · size ${item.size}` : ""}
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : (
                <p className="mt-6 text-sm text-fg-muted">
                    You have not ordered anything yet, so there is nothing on this list.
                </p>
            )}

            <section className="mt-8 max-w-prose">
                <h2 className="font-display text-lg font-semibold text-fg">If something you own is recalled</h2>
                <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-fg-muted">
                    <li>Stop using it.</li>
                    <li>Follow the remedy in the notice — a refund, a repair or a replacement.</li>
                    <li>
                        If it has to go back and it is still inside its window, start the return from{" "}
                        <Link href="/profile/returns" className="text-link">
                            your returns
                        </Link>
                        .
                    </li>
                </ol>
            </section>
        </>
    );
};

export default Page;
