import mongoose from "mongoose";

// Catalog for the Prime Video page, seeded from TMDB by scripts/seed-videos.mjs.
const videoSchema = new mongoose.Schema(
    {
        tmdbId: { type: Number, required: true },
        mediaType: { type: String, required: true, enum: ["movie", "tv"] },
        title: { type: String, required: true },
        slug: { type: String, required: true, index: true },
        overview: { type: String },
        posterPath: { type: String },
        backdropPath: { type: String },
        genres: [String],
        rating: { type: Number, default: 0 },
        popularity: { type: Number, default: 0 },
        voteCount: { type: Number, default: 0 },
        releaseDate: { type: String },
        maturity: { type: String, default: "" },
        badge: { type: String, default: "" },
        price: { type: Number, default: 0 },
        isOriginal: { type: Boolean, default: false },
        // Which carousels this title belongs to, e.g. ["popular-now","drama-movies"].
        rows: [String],
    },
    { timestamps: true }
);

videoSchema.index({ tmdbId: 1, mediaType: 1 }, { unique: true });

// The rows sort by popularity, sometimes within one media type.
videoSchema.index({ popularity: -1 });
videoSchema.index({ mediaType: 1, popularity: -1 });

const Video = mongoose.models.Video || mongoose.model("Video", videoSchema);

export default Video;
