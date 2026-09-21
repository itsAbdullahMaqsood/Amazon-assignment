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
        // What the customer's gift-card balance covered, deducted from total.
        giftCardApplied: {
            type: Number,
            default: 0,
        },
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
        // One entry per line the shopper asked to send back. `line` is the index
        // into `products`, and the name/image/qty are copied from that line by the
        // route handler so the card keeps rendering if the catalogue moves on.
        returnRequests: [
            {
                line: Number,
                name: String,
                image: String,
                qty: Number,
                reason: String,
                comments: String,
                refundTo: String,
                status: {
                    type: String,
                    default: "Return requested",
                    enum: ["Return requested", "Return approved", "Refunded"],
                },
                requestedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { timestamps: true }
);

// Every order screen reads one customer's orders newest first.
orderSchema.index({ user: 1, createdAt: -1 });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
