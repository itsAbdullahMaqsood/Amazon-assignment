// Shared between the list, the summary and the cards so the three never disagree
// about what a review's headline is or which order "Top reviews" means.

export const RATINGS = [5, 4, 3, 2, 1];

export const MIN_REVIEW = 10;
export const MAX_REVIEW = 1000;

export const FITS = ["Small", "True to size", "Large"];

// Amazon's cards lead with a bold one-line headline. Reviews here are stored as a
// single body, so the headline is the first line or first sentence when there is
// one short enough to read as a title, and otherwise there simply isn't one.
export const splitReview = (text: any) => {
    const trimmed = String(text || "").trim();
    const firstLine = trimmed.split("\n")[0].trim();

    if (firstLine && firstLine !== trimmed && firstLine.length <= 90) {
        return { title: firstLine, body: trimmed.slice(firstLine.length).trim() };
    }

    const sentence = trimmed.match(/^(.{1,90}?[.!?])\s+\S/);

    if (sentence) {
        return { title: sentence[1].trim(), body: trimmed.slice(sentence[1].length).trim() };
    }

    return { title: "", body: trimmed };
};

export const likeCount = (review: any) => (review?.likes || []).length;

export const likedBy = (review: any, userId: any) =>
    (review?.likes || []).some((like: any) => String(like) === String(userId));

// The variant line under a review: whichever of size and colour the reviewer
// actually recorded.
const readableColour = (value: any) =>
    // Colours are stored as hex, which says nothing to a reader; a named colour
    // is shown as-is and a hex value is dropped in favour of the swatch.
    value && !/^#?[0-9a-f]{3,8}$/i.test(String(value)) ? value : "";

export const variantLabel = (review: any) =>
    [review?.size && `Size: ${review.size}`, readableColour(review?.style?.color) && `Colour: ${review.style.color}`]
        .filter(Boolean)
        .join(" · ");

export const initialOf = (name: any) => String(name || "A").trim().charAt(0).toUpperCase() || "A";

// A star rating can be stored as 4.5, and the histogram buckets those upwards the
// same way the product page's own `ratings` percentages do.
export const bucketOf = (rating: any) => Math.floor(Number(rating) || 0);

export const countFor = (reviews: any[], rating: number) =>
    reviews.filter((review: any) => bucketOf(review.rating) === rating).length;

const timeOf = (review: any) => (review?.createdAt ? Date.parse(review.createdAt) || 0 : 0);

export const sortReviews = (reviews: any[], sort: string) =>
    [...reviews].sort((a: any, b: any) => {
        if (sort === "recent") {
            return timeOf(b) - timeOf(a);
        }

        // Top reviews: the ones other shoppers found helpful, with verified
        // purchases ahead of the rest on a tie, then the newest.
        return (
            likeCount(b) - likeCount(a) ||
            Number(Boolean(b.verified)) - Number(Boolean(a.verified)) ||
            timeOf(b) - timeOf(a)
        );
    });
