import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import { getUserMovies } from "@/lib/movieQueries";
import MyListView from "@/components/movies/MyListView";

export const metadata = { title: "My list" };

// My list and the library are the account's, so this page needs one. Browsing
// the catalogue does not.
const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/movies/my-list");
    }

    await connectDb();

    const user: any = await User.findById(session.user.id).select("watchlist library").lean();
    const initial = user ? await getUserMovies(user) : { list: [], library: [] };

    return (
        <main>
            <MyListView initial={initial} />
        </main>
    );
};

export default Page;
