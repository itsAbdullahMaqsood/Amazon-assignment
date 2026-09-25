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
        // Gift card money is only ever written by /api/user/giftcard/redeem, so the
        // balance and the ledger behind it stay server-owned.
        giftCardBalance: {
            type: Number,
            default: 0,
        },
        giftCardHistory: [
            {
                code: String,
                amount: Number,
                type: {
                    type: String,
                    enum: ["redeemed", "used"],
                    default: "redeemed",
                },
                at: Date,
            },
        ],
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
        // Most-recent-first, de-duplicated, capped in the route that writes it.
        recentlyViewed: [
            {
                product: {
                    type: ObjectId,
                    ref: "Product",
                },
                style: Number,
                viewedAt: Date,
            },
        ],
        // Named lists created on /lists/create. `whishlist` below stays the one
        // unnamed default list the product page saves into.
        lists: [
            {
                name: String,
                privacy: {
                    type: String,
                    default: "private",
                },
                items: [
                    {
                        product: {
                            type: ObjectId,
                            ref: "Product",
                        },
                        style: String,
                        addedAt: Date,
                        // Set when someone viewing a shared or public list says
                        // they have bought it, which is the only way this store
                        // can know: the cart carries no list with it.
                        purchasedBy: {
                            type: ObjectId,
                            ref: "User",
                        },
                        purchasedAt: Date,
                    },
                ],
                createdAt: Date,
            },
        ],
        // Markaz Movies. Saved titles and the library are the account's, not the
        // browser's: the price on a purchase or rental is read from the Video
        // document by the route that writes it, never sent by the client.
        watchlist: [
            {
                video: {
                    type: ObjectId,
                    ref: "Video",
                },
                addedAt: Date,
            },
        ],
        library: [
            {
                video: {
                    type: ObjectId,
                    ref: "Video",
                },
                type: {
                    type: String,
                    enum: ["buy", "rent"],
                },
                price: Number,
                at: Date,
                // Rentals only; a purchase never expires.
                expiresAt: Date,
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
