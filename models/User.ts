import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String },
        image: {
            type: String,
            default: "https://res.cloudinary.com/dmhcnhtng/image/upload/v1664642479/992490_b0iqzq.png",
        },
        emailVerified: { type: Boolean, default: false },
        role: { type: String, default: "user", enum: ["admin", "user"] },
        address: [
            {
                firstName: String,
                lastName: String,
                phoneNumber: String,
                address1: String,
                address2: String,
                city: String,
                state: String,
                zipCode: String,
                country: String,
                active: { type: Boolean, default: false },
            },
        ],
        wishlist: [
            {
                product: { type: ObjectId, ref: "Product" },
                style: String,
            },
        ],
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
