// The payment methods Markaz offers. Every one is simulated: no card details
// are collected and no money moves, and the checkout page says so.
export const paymentMethods = [
    {
        id: "credit_card",
        name: "Card",
        description: "Paid when you place the order. Simulated: no card details are asked for or stored.",
    },
    {
        id: "paypal",
        name: "PayPal",
        description: "Paid when you place the order. Simulated: you won't be sent to PayPal.",
    },
    {
        id: "cash",
        name: "Cash on delivery",
        description: "Pay the courier when it arrives. The order is placed now and marked paid on delivery.",
    },
];

export const PAYMENT_IDS = paymentMethods.map((method) => method.id);

export const paymentName = (id: string) => paymentMethods.find((method) => method.id === id)?.name || id;

// Methods that are charged the moment the order is placed.
export const paidOnPlacement = (id: string) => id !== "cash";
