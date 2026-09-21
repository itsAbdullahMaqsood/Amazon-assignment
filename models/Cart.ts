import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const cartSchema = new mongoose.Schema(
    {
        products: [
            {
                product: {
                    type: ObjectId,
                    ref: "Product",
                },
                name: String,
                image: String,
                size: String,
                qty: Number,
                color: {
                    color: String,
                    image: String,
                },
                price: Number,
            },
        ],
        cartTotal: Number,
        totalAfterDiscount: Number,
        user: {
            type: ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

// One cart per customer: savecart deletes and re-inserts, so the uniqueness is
// an invariant worth enforcing rather than a hopeful convention.
cartSchema.index({ user: 1 }, { unique: true });

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

export default Cart;
