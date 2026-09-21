import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import MenuSideBar from "@/components/Header/MenuSidebar";
import GiftCardsClient from "@/components/giftcards/GiftCardsClient";

export const metadata = {
    title: "Gift Cards",
};

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/gift-cards");
    }

    await connectDb();

    const user: any = await User.findById(session.user.id)
        .select("name giftCardBalance giftCardHistory")
        .lean();

    return (
        <>
            <Header title="Gift Cards" />

            <main className="bg-white min-h-[60vh]">
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-2">Gift Cards</h1>
                    <p className="text-slate-600 mb-6">
                        Check a balance, redeem a claim code, or send a card to someone else.
                    </p>

                    <GiftCardsClient
                        name={user?.name || ""}
                        balance={user?.giftCardBalance || 0}
                        history={JSON.parse(JSON.stringify(user?.giftCardHistory || []))}
                    />
                </div>
            </main>

            <Footer />

            <MenuSideBar />
        </>
    );
};

export default Page;
