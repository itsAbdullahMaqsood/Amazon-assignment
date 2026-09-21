import Link from "next/link";

import connectDb from "@/lib/db";
import Video from "@/models/Video";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import MenuSideBar from "@/components/Header/MenuSidebar";
import PrimeNav from "@/components/primeVideo/PrimeNav";
import WatchlistClient from "@/components/watchlist/WatchlistClient";

export const metadata = {
    title: "Watchlist",
};

// Public: the watchlist lives in the browser, so a signed-out visitor keeps one
// too. The server only supplies the catalogue the saved ids are matched against.
const Page = async () => {
    await connectDb();

    const withPoster: any = { posterPath: { $ne: "" } };

    const videos = await Video.find(withPoster)
        .sort({ popularity: -1 })
        .select("title posterPath releaseDate mediaType price")
        .lean();

    const serialized = JSON.parse(JSON.stringify(videos));

    return (
        <>
            <Header title="Watchlist" />

            <main className="bg-[#0f171e] text-white min-h-screen">
                <PrimeNav />

                {serialized.length === 0 ? (
                    <div className="max-w-2xl mx-auto my-24 px-6 text-center">
                        <h1 className="text-3xl font-bold">Your Watchlist is empty</h1>
                        <p className="mt-3 text-white/70">
                            There are no Prime Video titles in the database to save yet.
                        </p>
                        <Link
                            href="/prime-video"
                            className="inline-block mt-6 px-6 py-2 rounded-full bg-linear-to-r from-amazon-orange to-yellow-300 text-amazon-blue_dark"
                        >
                            Open Prime Video
                        </Link>
                    </div>
                ) : (
                    <WatchlistClient videos={serialized} suggestions={serialized.slice(0, 12)} />
                )}
            </main>

            <Footer />

            <MenuSideBar />
        </>
    );
};

export default Page;
