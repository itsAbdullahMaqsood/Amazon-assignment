import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

// Timestamped so "Most recent" sorts on something real. Reviews seeded before
// this was added carry no createdAt, so the cards fall back to no date rather
// than rendering an invalid one.
const reviewSchema = new mongoose.Schema(
    {
        reviewBy: {
            type: ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            default: 0,
        },
        review: {
            type: String,
            required: true,
        },
        size: String,
        style: {
            color: String,
            image: String,
        },
        fit: String,
        images: [],
        likes: [],
        // Earned, never claimed: the review route sets this from the reviewer's
        // own paid orders and ignores anything the request says about it.
        verified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// One Product is a listing; each subProducts entry is a COLOR VARIANT carrying its
// own images, size/price/qty rows and discount.
const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        brand: {
            type: String,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },
        category: {
            type: ObjectId,
            ref: "Category",
            required: true,
        },
        subCategories: [
            {
                type: ObjectId,
                ref: "SubCategory",
            },
        ],
        details: [
            {
                name: String,
                value: String,
            },
        ],
        questions: [
            {
                question: String,
                answer: String,
            },
        ],
        reviews: [reviewSchema],
        refundPolicy: {
            type: String,
            default: "30 days",
        },
        rating: {
            type: Number,
            default: 0,
        },
        numberReviews: {
            type: Number,
            default: 0,
        },
        shipping: {
            type: Number,
            default: 0,
        },
        subProducts: [
            {
                sku: String,
                images: [],
                description_images: [],
                color: {
                    color: String,
                    image: String,
                },
                sizes: [
                    {
                        size: String,
                        qty: Number,
                        price: Number,
                    },
                ],
                discount: {
                    type: Number,
                    default: 0,
                },
                sold: {
                    type: Number,
                    default: 0,
                },
            },
        ],
    },
    { timestamps: true }
);

// Every catalogue query the app runs was a collection scan. These cover the
// browse filters, the department links and the "top selling" sorts.
productSchema.index({ category: 1, rating: -1 });
productSchema.index({ brand: 1 });
productSchema.index({ "subProducts.sold": -1 });
productSchema.index({ createdAt: -1 });

// Mongoose's model registry outlives a hot reload, so an edit to the schema above
// would keep losing to the copy compiled when the dev server booted — saves would
// quietly drop any newly added field until someone restarted it. Re-registering in
// development keeps the running process in step with this file; production still
// registers once.
if (process.env.NODE_ENV !== "production" && mongoose.models.Product) {
    mongoose.deleteModel("Product");
}

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
