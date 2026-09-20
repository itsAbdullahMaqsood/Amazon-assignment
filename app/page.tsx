import Header from "@/components/Header/Header";
import MenuSideBar from "@/components/Header/MenuSidebar";
import Footer from "@/components/Footer";

const Home = () => {
    return (
        <>
            <Header title="Full Amazon Clone React" />

            <main className="max-w-(--breakpoint-2xl) mx-auto bg-gray-100">
                <div className="min-h-[50vh] flex items-center justify-center text-gray-500">
                    Home page content coming soon.
                </div>
            </main>

            <Footer />

            <MenuSideBar />
        </>
    );
};

export default Home;
