import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import MenuSideBar from "@/components/Header/MenuSidebar";
import ResetPage from "@/components/User/ResetPage";

const Page = async ({ params }: any) => {
    const { token } = await params;

    return (
        <>
            <Header title="Reset password" />

            <main className="bg-slate-100">
                <ResetPage token={token} />
            </main>

            <Footer />

            <MenuSideBar />
        </>
    );
};

export default Page;
