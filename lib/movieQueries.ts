import connectDb from "@/lib/db";
import Video from "@/models/Video";
import { canRent, movieRows, rentPrice } from "@/lib/movies";

const CARD_FIELDS = "title slug overview posterPath backdropPath genres rating voteCount releaseDate mediaType price badge";

// What a poster, a row and the detail sheet need, with both prices worked out
// here rather than in the browser.
export const toTitle = (video: any) => ({
    _id: String(video._id),
    title: video.title,
    slug: video.slug,
    overview: video.overview || "",
    posterPath: video.posterPath || "",
    backdropPath: video.backdropPath || "",
    genres: video.genres || [],
    rating: video.rating || 0,
    voteCount: video.voteCount || 0,
    year: String(video.releaseDate || "").slice(0, 4),
    mediaType: video.mediaType,
    badge: video.badge || "",
    price: video.price || 0,
    rentPrice: rentPrice(video.price || 0),
    canRent: canRent(video.price || 0),
});

export const getMovieHome = async () => {
    await connectDb();

    const videos: any[] = await Video.find().select(`${CARD_FIELDS} rows popularity`).lean();
    const titles = videos.map((video) => ({ ...toTitle(video), rows: video.rows || [], popularity: video.popularity || 0 }));

    const rows = movieRows
        .map((row) => ({ ...row, titles: titles.filter((title: any) => title.rows.includes(row.row)) }))
        .filter((row) => row.titles.length);

    // The hero has to be a title the buttons can actually do something with, so
    // it is the most popular one that has a backdrop and a price.
    const hero =
        [...titles]
            .filter((title: any) => title.backdropPath && title.price > 0)
            .sort((a: any, b: any) => b.popularity - a.popularity)[0] ||
        [...titles].filter((title: any) => title.backdropPath).sort((a: any, b: any) => b.popularity - a.popularity)[0] ||
        null;

    return JSON.parse(JSON.stringify({ hero, rows, count: titles.length }));
};

// The account's saved titles and its library, each joined to the catalogue. An
// entry whose title has left the catalogue drops out rather than rendering a
// hole.
export const getUserMovies = async (user: any) => {
    await connectDb();

    const ids = [
        ...(user.watchlist || []).map((entry: any) => String(entry.video)),
        ...(user.library || []).map((entry: any) => String(entry.video)),
    ];

    const videos: any[] = ids.length ? await Video.find({ _id: { $in: ids } }).select(CARD_FIELDS).lean() : [];
    const byId = new Map(videos.map((video) => [String(video._id), toTitle(video)]));

    const join = (entries: any[]) =>
        (entries || [])
            .map((entry: any) => ({ ...entry, video: byId.get(String(entry.video)) }))
            .filter((entry: any) => entry.video);

    return JSON.parse(
        JSON.stringify({
            list: join(user.watchlist).sort((a: any, b: any) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()),
            library: join(user.library).sort((a: any, b: any) => new Date(b.at).getTime() - new Date(a.at).getTime()),
        })
    );
};
