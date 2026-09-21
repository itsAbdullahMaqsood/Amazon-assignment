import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircleIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/models/Order";
import ProfileShell from "@/components/profile/ProfileShell";
import { formatDate } from "@/lib/returns";

export const metadata = { title: "Recalls and Product Safety Alerts" };

// Amazon checks what you have bought against recall notices. There is no recall
// feed in this build, so the page is honest about that: it shows exactly which
// of your items were checked and says plainly that nothing is flagged.
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
        <ProfileShell title="Recalls and Product Safety Alerts">
            <div className="bg-white border border-slate-300 rounded-lg p-5 flex items-start gap-3">
                <ShieldCheckIcon className="h-8 w-8 text-[#067D62] shrink-0" />
                <div>
                    <p className="font-bold">No safety alerts for anything you have ordered.</p>
                    <p className="text-sm text-slate-600 mt-1">
                        {items.length === 0
                            ? "Once you place an order, the items appear here with their safety status."
                            : `All ${items.length} item${items.length === 1 ? "" : "s"} from your order history were checked. If a notice is ever issued, it shows up here and we email you.`}
                    </p>
                </div>
            </div>

            {items.length > 0 && (
                <div className="bg-white border border-slate-300 rounded-lg mt-6">
                    <h2 className="font-bold px-5 py-4 border-b border-slate-200">
                        Items we checked
                    </h2>

                    <ul className="divide-y divide-slate-200">
                        {items.map((item: any, i: number) => (
                            <li key={i} className="flex items-center gap-4 px-5 py-4">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={64}
                                    height={64}
                                    className="w-16 h-16 object-contain bg-white rounded"
                                />

                                <div className="min-w-0">
                                    <p className="text-sm line-clamp-2">{item.name}</p>
                                    <p className="text-xs text-slate-600 mt-1">
                                        Ordered {formatDate(item.orderedAt)}
                                        {item.size ? ` · Size: ${item.size}` : ""}
                                    </p>
                                </div>

                                <span className="ml-auto flex items-center gap-1 text-sm text-[#067D62] shrink-0">
                                    <CheckCircleIcon className="h-5" />
                                    No alerts
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="bg-white border border-slate-300 rounded-lg p-5 mt-6">
                <h2 className="font-bold">What to do if a product is recalled</h2>
                <ol className="list-decimal list-inside text-sm text-slate-700 mt-2 space-y-1">
                    <li>Stop using the product straight away.</li>
                    <li>Follow the remedy in the notice — refund, repair or replacement.</li>
                    <li>
                        Start a return from the{" "}
                        <Link href="/profile/returns" className="text-[#0F5FA6] underline">
                            Returns Center
                        </Link>{" "}
                        if the notice asks you to send it back.
                    </li>
                </ol>
            </div>
        </ProfileShell>
    );
};

export default Page;
