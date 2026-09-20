import MenuSideBar from "@/components/Header/MenuSidebar";
import Header from "@/components/Header/Header";
import PharmacyNav from "@/components/pharmacy/PharmacyNav";
import MedicationSearch from "@/components/pharmacy/MedicationSearch";
import Faq from "@/components/pharmacy/Faq";
import {
    BenefitsStrip,
    CaregiverSection,
    CtaBand,
    DeliverySection,
    HereForYou,
    Hero,
    HowItWorks,
    InsuranceSection,
    MoreToExplore,
    PharmacyFooter,
    PromoBanner,
    SpendLess,
    Testimonials,
} from "@/components/pharmacy/sections";

export const metadata = {
    title: "Amazon Pharmacy",
};

const Page = () => {
    return (
        <>
            <Header title="Amazon Pharmacy" />

            <main className="bg-white">
                <PharmacyNav />
                <PromoBanner />
                <Hero />
                <BenefitsStrip />
                <SpendLess />
                <InsuranceSection />
                <CaregiverSection />
                <DeliverySection />
                <HereForYou />
                <HowItWorks />

                <section className="bg-[#eef6f1]">
                    <div className="max-w-[1400px] mx-auto px-6 py-16 text-center">
                        <h2 className="text-4xl font-extrabold text-[#102b3f]">
                            See if we have your medication
                        </h2>
                        <p className="mt-3 text-lg">Just search for your medication to find low prices.</p>

                        <div className="mt-8">
                            <MedicationSearch />
                        </div>
                    </div>
                </section>

                <Testimonials />
                <MoreToExplore />
                <Faq />
                <CtaBand />
                <PharmacyFooter />
            </main>

            <MenuSideBar />
        </>
    );
};

export default Page;
