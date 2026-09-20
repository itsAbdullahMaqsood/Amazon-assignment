import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Header from "@/components/Header/Header";
import MenuSideBar from "@/components/Header/MenuSidebar";
import CartClient from "@/components/CartPage/CartClient";

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/cart");
    }

    return (
        <>
            <Header title="Cart" />

            <main className="w-full h-screen">
                <CartClient />
            </main>

            <MenuSideBar />
        </>
    );
};

export default Page;
