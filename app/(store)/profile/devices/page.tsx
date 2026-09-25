import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ComputerDesktopIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import { describeUserAgent, lastSeenLabel, signInDate } from "@/lib/devices";
import Badge from "@/components/ui/Badge";
import { Notice, PageHeader } from "@/components/ui/Layout";
import SignOutEverywhere from "@/components/account/SignOutEverywhere";

export const metadata = { title: "Where you're signed in" };

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/devices");
    }

    await connectDb();

    const [user, requestHeaders]: any[] = await Promise.all([
        User.findById(session.user.id).select("signIns").lean(),
        headers(),
    ]);

    const currentAgent = requestHeaders.get("user-agent") || "";
    const signIns = [...(user?.signIns || [])].sort(
        (a: any, b: any) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
    );

    return (
        <>
            <PageHeader
                title="Where you're signed in"
                description="Every browser this account has signed in from, newest first."
            />

            {signIns.length === 0 ? (
                <Notice tone="neutral">
                    Nothing recorded yet. A browser is listed the next time you sign in from it — this page does not
                    log the browser you are simply reading it in.
                </Notice>
            ) : (
                <ul className="divide-y divide-line rounded-card border border-line bg-surface">
                    {signIns.map((entry: any, i: number) => {
                        const device = describeUserAgent(entry.userAgent);
                        const Icon = device.mobile ? DevicePhoneMobileIcon : ComputerDesktopIcon;
                        const current = entry.userAgent === currentAgent;

                        return (
                            <li key={i} className="flex items-start gap-3 px-4 py-4">
                                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-fg-muted">
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                </span>

                                <span className="min-w-0 flex-1">
                                    <span className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-medium text-fg">{device.label}</span>
                                        {current && <Badge tone="accent">This browser</Badge>}
                                    </span>
                                    <span className="mt-0.5 block text-sm text-fg-muted">
                                        {lastSeenLabel(entry.lastSeen)} · first signed in {signInDate(entry.firstSeen)}
                                    </span>
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}

            <div className="mt-8 border-t border-line pt-6">
                <h2 className="font-display text-lg font-semibold text-fg">Lost a device?</h2>
                <p className="mb-4 mt-1 max-w-prose text-sm text-fg-muted">
                    Signing out everywhere invalidates every session this account has, including this one, straight
                    away. It is the one control here that does something to another browser — a row cannot be removed
                    on its own, because the record is a note that a sign-in happened, not the session itself.
                </p>
                <SignOutEverywhere />
            </div>

            <p className="mt-8 max-w-prose text-sm text-fg-muted">
                Markaz keeps only the browser&apos;s user-agent string and the first and last time it signed in. No
                addresses, no locations and no list of devices you own: this store sells no hardware and registers
                none.
            </p>
        </>
    );
};

export default Page;
