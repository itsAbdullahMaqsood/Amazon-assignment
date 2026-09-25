import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import Card, { CardHeader } from "@/components/ui/Card";
import { money } from "@/components/ui/Price";
import { Notice, PageHeader } from "@/components/ui/Layout";
import { formatDate } from "@/lib/returns";
import PaymentSettings from "@/components/account/PaymentSettings";

export const metadata = { title: "Payment" };

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/payment");
    }

    await connectDb();

    const user: any = await User.findById(session.user.id)
        .select("defaultPaymentMethod giftCardBalance giftCardHistory")
        .lean();

    const history = [...(user?.giftCardHistory || [])]
        .sort((a: any, b: any) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .slice(0, 4);

    return (
        <>
            <PageHeader title="Payment" description="How checkout pays, and what your Markaz balance covers." />

            <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
                <Card>
                    <CardHeader title="Default payment method" description="Checkout opens on this one. You can still change it there." />
                    <PaymentSettings defaultPaymentMethod={user?.defaultPaymentMethod || ""} />
                </Card>

                <Card>
                    <CardHeader title="Markaz balance" description="Spent before the payment method, on the order that uses it." />

                    <p className="font-display text-3xl font-semibold tabular text-fg">{money(user?.giftCardBalance || 0)}</p>

                    {history.length > 0 && (
                        <ul className="mt-4 divide-y divide-line border-t border-line text-sm">
                            {history.map((entry: any, i: number) => (
                                <li key={i} className="flex items-baseline justify-between gap-3 py-2">
                                    <span className="min-w-0">
                                        <span className="block text-fg">{entry.type === "used" ? "Spent on an order" : `Redeemed ${entry.code}`}</span>
                                        <span className="block text-xs text-fg-muted">{formatDate(entry.at)}</span>
                                    </span>
                                    <span className={entry.type === "used" ? "tabular text-fg-muted" : "tabular text-success"}>
                                        {entry.type === "used" ? "−" : "+"}
                                        {money(Math.abs(entry.amount))}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <Link href="/gift-cards" className="mt-4 inline-block text-sm text-link">
                        Redeem a gift card
                    </Link>
                </Card>
            </div>

            <Notice tone="neutral" title="Payments here are simulated" className="mt-6">
                No card number, expiry or security code is ever asked for or stored, so there are no cards to
                manage. Card and PayPal orders are marked paid the moment they are placed; cash on delivery is
                paid when it arrives.
            </Notice>
        </>
    );
};

export default Page;
