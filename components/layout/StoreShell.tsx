import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import MenuSideBar from "@/components/Header/MenuSidebar";
import Toaster from "@/components/ui/Toaster";

// Everything a shopper sees around a page: header, drawer, footer, toasts. The
// (store) route group renders it once for every page inside it, and the root
// not-found and forbidden pages render it themselves.
const StoreShell = ({ children }: any) => (
    <div className="flex min-h-dvh flex-col">
        <a
            href="#content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[80] focus:rounded-card focus:bg-surface focus:px-4 focus:py-2 focus:shadow-pop"
        >
            Skip to content
        </a>

        <Header />

        <div id="content" className="flex-1">
            {children}
        </div>

        <Footer />

        <MenuSideBar />

        <Toaster />
    </div>
);

export default StoreShell;
