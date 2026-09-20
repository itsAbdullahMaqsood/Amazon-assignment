import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const subCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            minLength: 2,
            maxLength: 32,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },
        parent: {
            type: ObjectId,
            ref: "Category",
            required: true,
        },
    },
    { timestamps: true }
);

const SubCategory = mongoose.models.SubCategory || mongoose.model("SubCategory", subCategorySchema);

export default SubCategory;
