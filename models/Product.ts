import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const reviewSchema = new mongoose.Schema({
    reviewBy: { type: ObjectId, ref: "User" },
    rating: { type: Number, default: 0 },
    review: { type: String },
    size: { type: String },
    style: {
        color: String,
        image: String,
    },
    fit: { type: String },
    images: [],
    likes: [],
});

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        brand: { type: String },
        slug: { type: String, required: true, unique: true, lowercase: true, index: true },
        category: { type: ObjectId, ref: "Category", required: true },
        subCategories: [{ type: ObjectId, ref: "SubCategory" }],
        details: [{ name: String, value: String }],
        questions: [{ question: String, answer: String }],
        reviews: [reviewSchema],
        refundPolicy: { type: String, default: "30 days" },
        rating: { type: Number, default: 0 },
        numReviews: { type: Number, default: 0 },
        shipping: { type: Number, default: 0 },
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
                discount: { type: Number, default: 0 },
                sold: { type: Number, default: 0 },
            },
        ],
    },
    { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
