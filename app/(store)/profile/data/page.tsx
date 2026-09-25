import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/Layout";
import DataView from "@/components/account/DataView";

export const metadata = { title: "Privacy & data" };

// Written from the schema rather than from a policy: each line names something
// the User, Cart or Order document actually stores.
const holdings = [
    {
        title: "Who you are",
        body: "Your name and email, and a bcrypt hash of your password. The password itself is never stored. An account created through Google or GitHub has no password at all.",
    },
    {
        title: "Where things go",
        body: "The delivery addresses you have saved, with the phone number on each and which one checkout uses.",
    },
    {
        title: "What is in your cart",
        body: "The cart is kept against your account so it follows you between devices: product, colour, size, quantity and the price when you added it.",
    },
    {
        title: "What you have ordered",
        body: "Items, totals, delivery charge, the address used, the payment method's name, whether it was paid, and any return requests. No card details, because none are ever collected.",
    },
    {
        title: "What you have looked at",
        body: "Browsing history keeps the product, the colour and when you opened it, unless you have switched that off.",
    },
    {
        title: "What you have saved",
        body: "Saved items, named lists with the privacy you chose for each, My list and your Markaz Movies library.",
    },
    {
        title: "How you sign in",
        body: "The user-agent string of each browser you have signed in from, and the first and last time it did. Nothing else about the request, and no location.",
    },
];

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/data");
    }

    return (
        <>
            <PageHeader
                title="Privacy & data"
                description="Everything Markaz holds about you, a copy of it whenever you want one, and the way out."
            />
            <DataView email={session.user.email} holdings={holdings} />
        </>
    );
};

export default Page;
