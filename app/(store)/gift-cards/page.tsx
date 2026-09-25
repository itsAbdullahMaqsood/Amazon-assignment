import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import { DEMO_CODES } from "@/lib/giftcards";
import { Container, PageHeader } from "@/components/ui/Layout";
import GiftCardsView from "@/components/gift/GiftCardsView";

export const metadata = { title: "Gift cards" };

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/gift-cards");
    }

    await connectDb();

    const user: any = await User.findById(session.user.id).select("giftCardBalance giftCardHistory").lean();

    return (
        <main className="pb-14">
            <Container className="max-w-5xl">
                <PageHeader
                    title="Gift cards"
                    description="Your Markaz balance, where it came from and where it went."
                />
                <GiftCardsView
                    balance={user?.giftCardBalance || 0}
                    history={JSON.parse(JSON.stringify(user?.giftCardHistory || []))}
                    demoCodes={DEMO_CODES}
                />
            </Container>
        </main>
    );
};

export default Page;
