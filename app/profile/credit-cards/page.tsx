import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import ProfileShell from "@/components/profile/ProfileShell";
import CreditCardsClient from "@/components/profile/CreditCardsClient";

export const metadata = {
    title: "Amazon credit cards",
};

// The only card-shaped thing the user model stores is the default payment
// method, so "Your cards" lists that when it is a card and is empty otherwise.
const savedCards = (user: any) =>
    user?.defaultPaymentMethod === "credit_card"
        ? [
              {
                  id: "credit_card",
                  name: "Credit card",
                  description: "Saved as your default payment method at checkout.",
                  tail: String(user._id).slice(-4).replace(/\D/g, "").padStart(4, "0"),
              },
          ]
        : [];

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/credit-cards");
    }

    await connectDb();

    const user: any = await User.findById(session.user.id).select("defaultPaymentMethod").lean();

    return (
        <ProfileShell title="Amazon credit cards">
            <CreditCardsClient savedCards={savedCards(user)} />
        </ProfileShell>
    );
};

export default Page;
