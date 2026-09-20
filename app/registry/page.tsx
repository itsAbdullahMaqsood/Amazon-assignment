import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import MenuSideBar from "@/components/Header/MenuSidebar";
import RegistryNav from "@/components/registry/RegistryNav";
import RegistrySearch from "@/components/registry/RegistrySearch";
import { CreateStrip, Hero, Reasons, UniqueToYou } from "@/components/registry/sections";

export const metadata = {
    title: "Registry & Gifting",
};

const Page = () => {
    return (
        <>
            <Header title="Registry & Gifting" />

            <main className="bg-white">
                <RegistryNav />

                <Hero />

                <section className="max-w-[1500px] mx-auto px-6 pt-10">
                    <div className="bg-[#f7f8f8] border border-slate-200 rounded-lg px-6 py-8">
                        <h2 className="text-2xl font-bold text-center">
                            Find a list or registry
                        </h2>
                        <p className="mt-2 text-center text-[15px]">
                            Search for a friend&apos;s registry or gift list by their name.
                        </p>

                        <div className="mt-6 max-w-3xl mx-auto">
                            <RegistrySearch />
                        </div>
                    </div>
                </section>

                <Reasons />
                <CreateStrip />
                <UniqueToYou />
            </main>

            <Footer />

            <MenuSideBar />
        </>
    );
};

export default Page;
