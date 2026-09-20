import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import MenuSideBar from "@/components/Header/MenuSidebar";
import RegisterPage from "@/components/User/RegisterPage";

const Page = async ({ searchParams }: any) => {
    const query = await searchParams;
    const session = await auth();

    if (session) {
        redirect(query?.callbackUrl || "/");
    }

    return (
        <>
            <Header title="Sign up" />

            <main className="bg-slate-100">
                <RegisterPage />
            </main>

            <Footer />

            <MenuSideBar />
        </>
    );
};

export default Page;
