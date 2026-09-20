import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const reviewSchema = new mongoose.Schema({
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
});

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

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
