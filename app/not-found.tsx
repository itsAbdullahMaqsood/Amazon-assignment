import Link from "next/link";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import MenuSideBar from "@/components/Header/MenuSidebar";

// Amazon's 404: an apology, a few ways back in, and no site search results.
const NotFound = () => {
    return (
        <>
            <Header title="Page not found" />

            <main className="bg-white">
                <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-10">
                    <div
                        aria-hidden="true"
                        className="w-40 h-40 shrink-0 rounded-full bg-linear-to-b from-slate-100 to-slate-200 flex items-center justify-center"
                    >
                        <span className="text-6xl font-bold text-slate-400">404</span>
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-[#0F1111]">
                            Sorry! We couldn&apos;t find that page.
                        </h1>
                        <p className="text-sm text-slate-600 mt-2">
                            The link may be broken, or the product may no longer be in the
                            catalogue. Here are a few places to pick up where you left off.
                        </p>

                        <ul className="mt-5 space-y-2 text-sm text-[#007185]">
                            <li>
                                <Link href="/" className="hover:underline">
                                    Go to the Amazon home page
                                </Link>
                            </li>
                            <li>
                                <Link href="/browse" className="hover:underline">
                                    Browse every department
                                </Link>
                            </li>
                            <li>
                                <Link href="/profile/orders" className="hover:underline">
                                    See your orders
                                </Link>
                            </li>
                            <li>
                                <Link href="/customer-service" className="hover:underline">
                                    Visit Customer Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </main>

            <Footer />

            <MenuSideBar />
        </>
    );
};

export default NotFound;
