"use client";

import Button from "@/components/ui/Button";
import useAddToCart from "@/components/cart/useAddToCart";

// Adds one or more order lines back to the cart, each in the variant and size
// it was bought in. Lines whose product or option has gone are skipped.
const BuyAgainButton = ({ lines = [], label = "Buy again", variant = "outline", size = "sm", className = "" }: any) => {
    const { add, pending } = useAddToCart();
    const available = lines.filter((line: any) => line.rebuy);

    if (!available.length) {
        return null;
    }

    const handler = async () => {
        for (const [i, line] of available.entries()) {
            // Only the last one confirms, so several lines give one toast.
            await add({ ...line.rebuy, qty: line.qty || 1, silent: i < available.length - 1 });
        }
    };

    return (
        <Button variant={variant} size={size} onClick={handler} loading={!!pending} className={className}>
            {label}
        </Button>
    );
};

export default BuyAgainButton;
