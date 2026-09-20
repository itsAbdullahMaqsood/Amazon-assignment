import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        password: {
            type: String,
        },
        role: {
            type: String,
            default: "user",
        },
        image: {
            type: String,
            default: "https://i.im.ge/2023/04/25/Lg2cWX.user-image-default.jpg",
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        defaultPaymentMethod: {
            type: String,
            default: "",
        },
        address: [
            {
                firstName: String,
                lastName: String,
                phoneNumber: String,
                address1: String,
                address2: String,
                city: String,
                zipCode: String,
                state: String,
                country: String,
                active: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        // Misspelled on purpose: later prompts read `whishlist`.
        whishlist: [
            {
                product: {
                    type: ObjectId,
                    ref: "Product",
                },
                style: String,
            },
        ],
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
