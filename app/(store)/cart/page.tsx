import { redirect } from "next/navigation";

import { auth } from "@/auth";
import CartClient from "@/components/CartPage/CartClient";

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/cart");
    }

    return (
        <>

            <main className="w-full h-screen">
                <CartClient />
            </main>

        </>
    );
};

export default Page;
