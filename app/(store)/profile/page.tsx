import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getAccountOverview } from "@/lib/account";
import { formatDate, orderNumber } from "@/lib/returns";
import { paymentName, paymentMethods } from "@/lib/payments";
import { addressLines } from "@/lib/address";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { money } from "@/components/ui/Price";
import { PageHeader, SectionHeader } from "@/components/ui/Layout";
import StatusPill from "@/components/orders/StatusPill";
import ProductRail from "@/components/landing/ProductRail";
import SectionGrid from "@/components/account/SectionGrid";

export const metadata = { title: "Your account" };

const Empty = ({ children }: any) => <p className="text-sm text-fg-muted">{children}</p>;

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile");
    }

    const account = await getAccountOverview(session.user.id);

    if (!account) {
        redirect("/auth/signin?callbackUrl=/profile");
    }

    const { latestOrder, defaultAddress } = account;
    const method = paymentMethods.find((entry) => entry.id === account.paymentMethod);

    return (
        <>
            <PageHeader
                title={`Hello, ${account.name.split(" ")[0]}`}
                description={
                    <>
                        {account.email}
                        {account.memberSince && <> · with Markaz since {formatDate(account.memberSince)}</>}
                    </>
                }
                className="pt-4 md:pt-6"
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="sm:col-span-2 lg:col-span-1">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="font-display text-lg font-semibold text-fg">Latest order</h2>
                            {latestOrder && (
                                <p className="mt-0.5 text-sm text-fg-muted">
                                    #{orderNumber(latestOrder._id)} · placed {formatDate(latestOrder.createdAt)}
                                </p>
                            )}
                        </div>
                        {latestOrder && <StatusPill state={latestOrder.state} />}
                    </div>

                    {latestOrder ? (
                        <>
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                {latestOrder.lines.map((line: any, i: number) => (
                                    <span key={i} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-control bg-surface-muted">
                                        {line.image && <Image src={line.image} alt={line.name} fill sizes="56px" className="object-contain p-1" />}
                                    </span>
                                ))}
                            </div>

                            <p className="mt-3 text-sm text-fg-muted">
                                {latestOrder.itemCount} item{latestOrder.itemCount === 1 ? "" : "s"} ·{" "}
                                <span className="tabular text-fg">{money(latestOrder.total)}</span>
                            </p>

                            <div className="mt-5 flex flex-wrap gap-2">
                                <Button href={`/order/${latestOrder._id}`} size="sm">
                                    View order
                                </Button>
                                <Button href="/profile/orders" variant="outline" size="sm">
                                    All {account.orderCount} orders
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Empty>You haven&apos;t placed an order yet.</Empty>
                            <Button href="/browse" size="sm" className="mt-4">
                                Start shopping
                            </Button>
                        </>
                    )}
                </Card>

                <Card>
                    <h2 className="font-display text-lg font-semibold text-fg">Delivering to</h2>

                    {defaultAddress ? (
                        <address className="mt-2 text-sm not-italic text-fg-muted">
                            <span className="block font-medium text-fg">
                                {defaultAddress.firstName} {defaultAddress.lastName}
                            </span>
                            {addressLines(defaultAddress).map((line: string) => (
                                <span key={line} className="block">
                                    {line}
                                </span>
                            ))}
                        </address>
                    ) : (
                        <Empty>No address saved yet.</Empty>
                    )}

                    <Link href="/profile/address" className="mt-4 inline-block text-sm text-link">
                        {defaultAddress ? `Manage ${account.addressCount} address${account.addressCount === 1 ? "" : "es"}` : "Add an address"}
                    </Link>
                </Card>

                <Card>
                    <h2 className="font-display text-lg font-semibold text-fg">Paying with</h2>

                    {method ? (
                        <p className="mt-2 text-sm">
                            <span className="block font-medium text-fg">{paymentName(method.id)}</span>
                            <span className="block text-fg-muted">Chosen for you at checkout.</span>
                        </p>
                    ) : (
                        <Empty>No default chosen — checkout asks each time.</Empty>
                    )}

                    <p className="mt-3 border-t border-line pt-3 text-sm">
                        <span className="text-fg-muted">Markaz balance </span>
                        <span className="font-medium tabular text-fg">{money(account.giftCardBalance)}</span>
                    </p>

                    <p className="mt-1 text-sm">
                        <span className="text-fg-muted">Markaz Plus </span>
                        <span className="font-medium text-fg">
                            {account.membership.active
                                ? account.membership.inTrial
                                    ? "free trial"
                                    : "member"
                                : "not a member"}
                        </span>
                        {account.membership.active && <span className="text-fg-muted"> · delivery is free</span>}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        <Link href="/profile/payment" className="text-link">
                            Payment settings
                        </Link>
                        <Link href="/gift-cards" className="text-link">
                            Redeem a gift card
                        </Link>
                        <Link href="/plus" className="text-link">
                            Markaz Plus
                        </Link>
                    </div>
                </Card>
            </div>

            {account.recentlyViewed.length > 0 && (
                <div className="mt-10">
                    <ProductRail
                        title="Pick up where you left off"
                        href="/profile/recent"
                        linkLabel="Browsing history"
                        products={account.recentlyViewed}
                    />
                </div>
            )}

            <section className="mt-10">
                <SectionHeader title="Everything in your account" />
                <SectionGrid
                    counts={{
                        "/profile/orders": account.orderCount,
                        "/profile/returns": account.returnsCount,
                        "/profile/wishlist": account.savedCount,
                        "/lists": account.listCount,
                        "/profile/address": account.addressCount,
                    }}
                />
            </section>
        </>
    );
};

export default Page;
