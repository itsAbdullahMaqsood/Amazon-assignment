import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    },
    { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;
