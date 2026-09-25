import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import Card, { CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/Layout";
import NameForm from "@/components/account/NameForm";
import PasswordForm from "@/components/account/PasswordForm";

export const metadata = { title: "Login & security" };

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/security");
    }

    await connectDb();

    const user: any = await User.findById(session.user.id).select("name email password emailVerified").lean();

    if (!user) {
        redirect("/auth/signin?callbackUrl=/profile/security");
    }

    // A provider account has no password stored, so the page can say which of
    // the two ways in this account actually uses instead of offering both.
    const hasPassword = Boolean(user.password);

    return (
        <>
            <PageHeader title="Login & security" description="Who this account says you are, and how you get in." />

            <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
                <Card>
                    <CardHeader title="Your details" />

                    <NameForm name={user.name} />

                    <div className="mt-5 border-t border-line pt-4">
                        <p className="text-sm font-medium text-fg">Email address</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-fg-muted">
                            {user.email}
                            {user.emailVerified ? <Badge tone="success">Confirmed</Badge> : <Badge tone="warning">Not confirmed</Badge>}
                        </p>
                        <p className="mt-2 text-sm text-fg-muted">
                            Your email is how this account is identified — every order, list and sign-in hangs off
                            it — so it can&apos;t be swapped here.
                        </p>
                    </div>
                </Card>

                <Card>
                    <CardHeader
                        title="How you sign in"
                        description={
                            hasPassword
                                ? "With your email address and a password."
                                : "With Google or GitHub. No password is stored for this account."
                        }
                    />

                    {hasPassword ? (
                        <PasswordForm />
                    ) : (
                        <>
                            <p className="text-sm text-fg-muted">
                                You can add a password as a second way in. Markaz emails you a link to choose one;
                                signing in with Google or GitHub keeps working either way.
                            </p>
                            <Button href="/auth/forgot" variant="outline" className="mt-4">
                                Email me a link
                            </Button>
                        </>
                    )}
                </Card>
            </div>

            <p className="mt-6 text-sm text-fg-muted">
                Closing the account, and everything Markaz holds about you, lives under{" "}
                <Link href="/profile/data" className="text-link">
                    privacy &amp; data
                </Link>
                .
            </p>
        </>
    );
};

export default Page;
