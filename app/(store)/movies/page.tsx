import Link from "next/link";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import { getMovieHome, getUserMovies } from "@/lib/movieQueries";
import MoviesView from "@/components/movies/MoviesView";

export const metadata = { title: "Markaz Movies" };

const Page = async () => {
    const session = await auth();
    const { hero, rows, count } = await getMovieHome();

    // Signed out, the catalogue still browses; only the list and the library
    // need an account, because they are stored on it.
    let initial: any = { list: [], library: [] };

    if (session) {
        await connectDb();
        const user: any = await User.findById(session.user.id).select("watchlist library").lean();

        if (user) {
            initial = await getUserMovies(user);
        }
    }

    if (!count) {
        return (
            <main className="bg-ink-950 text-fg-inverse">
                <div className="mx-auto max-w-xl px-4 py-24 text-center">
                    <h1 className="font-display text-2xl font-semibold">No titles yet</h1>
                    <p className="mt-3 text-sm text-fg-inverse-muted">
                        The Markaz Movies catalogue is seeded from TMDB. Add <code>TMDB_API_KEY</code> to{" "}
                        <code>.env.local</code> and run <code>npm run seed:videos</code>.
                    </p>
                    <Link href="/" className="mt-6 inline-block text-sm text-accent underline underline-offset-2">
                        Back to the store
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main>
            <MoviesView hero={hero} rows={rows} count={count} initial={initial} signedIn={!!session} />
        </main>
    );
};

export default Page;
