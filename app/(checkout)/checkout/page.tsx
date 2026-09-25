import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import { computeQuote } from "@/lib/checkout";
import CheckoutView from "@/components/checkout/CheckoutView";

export const metadata = { title: "Checkout" };

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/cart");
    }

    await connectDb();

    const [user, quote]: any = await Promise.all([
        User.findById(session.user.id).select("address defaultPaymentMethod giftCardBalance").lean(),
        computeQuote(session.user.id),
    ]);

    // The Cart document is written when the shopper leaves the cart page; no
    // document means they came here directly.
    if (!quote) {
        redirect("/cart");
    }

    return (
        <CheckoutView
            addresses={JSON.parse(JSON.stringify(user?.address || []))}
            defaultPayment={user?.defaultPaymentMethod || ""}
            initialQuote={quote}
        />
    );
};

export default Page;
