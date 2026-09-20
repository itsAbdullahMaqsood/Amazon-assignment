import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: ObjectId,
            ref: "User",
            required: true,
        },
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
        shippingAddress: {
            firstName: String,
            lastName: String,
            phoneNumber: String,
            address1: String,
            address2: String,
            city: String,
            zipCode: String,
            state: String,
            country: String,
        },
        paymentMethod: String,
        paymentResult: {
            id: String,
            status: String,
            email: String,
        },
        total: {
            type: Number,
            required: true,
        },
        shippingPrice: {
            type: Number,
            required: true,
            default: 0,
        },
        totalBeforeDiscount: Number,
        couponApplied: String,
        taxPrice: {
            type: Number,
            default: 0,
        },
        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        status: {
            type: String,
            default: "Not Processed",
            enum: ["Not Processed", "Processing", "Dispatched", "Cancelled", "Completed"],
        },
        paidAt: Date,
        deliveredAt: Date,
    },
    { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
