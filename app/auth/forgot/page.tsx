import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import MenuSideBar from "@/components/Header/MenuSidebar";
import ForgotPage from "@/components/User/ForgotPage";

const Page = () => {
    return (
        <>
            <Header title="Forgot password" />

            <main className="bg-slate-100">
                <ForgotPage />
            </main>

            <Footer />

            <MenuSideBar />
        </>
    );
};

export default Page;
