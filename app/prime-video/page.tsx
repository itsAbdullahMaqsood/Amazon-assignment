import Link from "next/link";

import connectDb from "@/lib/db";
import Video from "@/models/Video";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import MenuSideBar from "@/components/Header/MenuSidebar";
import PrimeNav from "@/components/primeVideo/PrimeNav";
import Hero from "@/components/primeVideo/Hero";
import VideoRow from "@/components/primeVideo/VideoRow";

const rows = [
    { row: "popular-now", label: "Popular now", portrait: false },
    { row: "action-adventure", label: "Action and adventure movies", portrait: false },
    { row: "mystery-thriller", label: "Mystery and thriller movies", portrait: false },
    { row: "featured-originals", label: "Featured Originals and Exclusives", portrait: true },
    { row: "deals-under-5", label: "$4.99 or less movie deals", portrait: false },
    { row: "drama-movies", label: "Drama movies", portrait: false },
    { row: "under-10-price-drops", label: "Under $10: New movie price drops", portrait: false },
];

export const metadata = {
    title: "Prime Video",
};

const Page = async () => {
    await connectDb();

    const videos = await Video.find().lean();
    const serialized = JSON.parse(JSON.stringify(videos));

    const forRow = (row: string) =>
        serialized.filter((video: any) => (video.rows || []).includes(row));

    // The hero runs on the four most popular originals that have a backdrop.
    const heroSlides = serialized
        .filter((video: any) => video.backdropPath && video.isOriginal)
        .slice(0, 4);

    const fallbackHero = serialized.filter((video: any) => video.backdropPath).slice(0, 4);
    const slides = heroSlides.length ? heroSlides : fallbackHero;

    return (
        <>
            <Header title="Prime Video" />

            <main className="bg-[#0f171e] text-white min-h-screen">
                <PrimeNav />

                {serialized.length === 0 ? (
                    <div className="max-w-2xl mx-auto my-24 px-6 text-center">
                        <h1 className="text-3xl font-bold">No titles yet</h1>
                        <p className="mt-3 text-white/70">
                            The Prime Video catalog is seeded from TMDB. Add <code>TMDB_API_KEY</code>{" "}
                            to <code>.env.local</code> and run <code>npm run seed:videos</code>.
                        </p>
                        <Link
                            href="/"
                            className="inline-block mt-6 px-6 py-2 rounded-full bg-linear-to-r from-amazon-orange to-yellow-300 text-amazon-blue_dark"
                        >
                            Back to the store
                        </Link>
                    </div>
                ) : (
                    <>
                        <Hero slides={slides} />

                        <div className="max-w-[1500px] mx-auto pb-16">
                            {rows.map((row) => (
                                <VideoRow
                                    key={row.row}
                                    title={row.label}
                                    videos={forRow(row.row)}
                                    portrait={row.portrait}
                                />
                            ))}
                        </div>
                    </>
                )}
            </main>

            <Footer />

            <MenuSideBar />
        </>
    );
};

export default Page;
