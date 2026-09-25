import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import Video from "@/models/Video";
import { RENTAL_DAYS, rentPrice, rentalLive } from "@/lib/movies";
import { getUserMovies } from "@/lib/movieQueries";

const SELECT = "watchlist library";

const load = async (userId: string) => {
    const user: any = await User.findById(userId).select(SELECT).lean();

    return user ? getUserMovies(user) : { list: [], library: [] };
};

export const GET = async () => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        await connectDb();

        return NextResponse.json(await load(session.user.id));
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

// POST { videoId, action: "save" | "buy" | "rent" }
//
// The client never sends a price. Buying and renting read the title's own price
// from the catalogue and write what was charged into the library entry, so the
// record cannot disagree with what the page showed.
export const POST = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { videoId, action } = await req.json();

        if (!["save", "buy", "rent"].includes(action)) {
            return NextResponse.json({ message: "Unknown action." }, { status: 400 });
        }

        await connectDb();

        const video: any = await Video.findById(videoId).select("title price").lean();

        if (!video) {
            return NextResponse.json({ message: "That title is no longer in the catalogue." }, { status: 404 });
        }

        const user: any = await User.findById(session.user.id).select(SELECT);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (action === "save") {
            const known = user.watchlist.some((entry: any) => String(entry.video) === String(videoId));

            if (!known) {
                user.watchlist.push({ video: videoId, addedAt: new Date() });
            }

            await user.save();

            return NextResponse.json({ ...(await load(session.user.id)), message: known ? "Already on your list." : "Added to My list." });
        }

        if (!video.price) {
            return NextResponse.json({ message: "This title isn't for sale on Markaz." }, { status: 400 });
        }

        const owned = user.library.find((entry: any) => String(entry.video) === String(videoId) && entry.type === "buy");

        if (owned) {
            return NextResponse.json({ message: "You already own this title." }, { status: 400 });
        }

        const renting = user.library.find((entry: any) => String(entry.video) === String(videoId) && rentalLive(entry));

        if (renting && action === "rent") {
            return NextResponse.json({ message: "Your rental of this title is still running." }, { status: 400 });
        }

        const at = new Date();
        const price = action === "rent" ? rentPrice(video.price) : video.price;

        user.library.push({
            video: videoId,
            type: action,
            price,
            at,
            expiresAt: action === "rent" ? new Date(at.getTime() + RENTAL_DAYS * 86400000) : undefined,
        });

        // A title that has been bought or rented leaves the list of things you
        // meant to get around to.
        user.watchlist = user.watchlist.filter((entry: any) => String(entry.video) !== String(videoId));

        await user.save();

        return NextResponse.json({
            ...(await load(session.user.id)),
            message: action === "buy" ? `${video.title} is yours to keep.` : `${video.title} is rented for ${RENTAL_DAYS} days.`,
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

// Removing only ever touches the saved list. A purchase or a rental is a record
// of something that happened and is not deleted from here.
export const DELETE = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { videoId } = await req.json();

        await connectDb();

        const user: any = await User.findById(session.user.id).select(SELECT);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        user.watchlist = user.watchlist.filter((entry: any) => String(entry.video) !== String(videoId));
        await user.save();

        return NextResponse.json({ ...(await load(session.user.id)), message: "Removed from My list." });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
