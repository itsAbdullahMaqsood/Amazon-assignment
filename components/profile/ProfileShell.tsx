import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import MenuSideBar from "@/components/Header/MenuSidebar";

const ProfileShell = ({ title, children }: any) => {
    return (
        <>
            <Header title={title} />

            <main className="bg-white min-h-[60vh]">
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-slate-600">
                        <Link href="/profile" className="hover:underline">
                            Your Account
                        </Link>
                        <ChevronRightIcon className="h-3 mx-1" />
                        <span>{title}</span>
                    </nav>

                    <h1 className="text-3xl font-bold mt-2 mb-6">{title}</h1>

                    {children}
                </div>
            </main>

            <Footer />

            <MenuSideBar />
        </>
    );
};

export default ProfileShell;
