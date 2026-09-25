import { round2 } from "@/lib/price";

// The order arithmetic, shared by the cart (on the client), the checkout quote
// and order creation (on the server), so the total a shopper sees in the cart is
// computed exactly the way the order is charged.
//
// Delivery is a flat charge per product line, as stored on the product (the
// seed charges small items under $20); it does not multiply with quantity.
export const summarize = (lines: { price: number; qty: number; shipping?: number }[]) => {
    const items = lines.reduce((sum, line) => sum + (Number(line.qty) || 0), 0);
    const subtotal = round2(lines.reduce((sum, line) => sum + (Number(line.price) || 0) * (Number(line.qty) || 0), 0));
    const shipping = round2(lines.reduce((sum, line) => sum + (Number(line.shipping) || 0), 0));

    return { items, subtotal, shipping, total: round2(subtotal + shipping) };
};

// A coupon discounts the goods, never the delivery charge; a gift card balance
// then covers as much of what is left as it can.
export const applyAdjustments = (
    base: { subtotal: number; shipping: number },
    { couponPercent = 0, giftCardBalance = 0 }: { couponPercent?: number; giftCardBalance?: number }
) => {
    const discount = round2((base.subtotal * couponPercent) / 100);
    const beforeGiftCard = round2(base.subtotal - discount + base.shipping);
    const giftCard = round2(Math.min(Math.max(giftCardBalance, 0), beforeGiftCard));

    return { discount, giftCard, total: round2(beforeGiftCard - giftCard) };
};
