// Price arithmetic shared by pages, cards and API routes, so a discount is
// applied the same way everywhere the shopper sees it.
export const round2 = (value: number) => Math.round((Number(value) || 0) * 100) / 100;

export const applyDiscount = (price: number, discount: number) =>
    round2(discount > 0 ? price - (price * discount) / 100 : price);

// The cheapest thing the listing sells, after its variant's discount, and the
// list price that goes with it.
export const lowestPrice = (product: any) => {
    let best: { price: number; listPrice: number; discount: number } | null = null;

    for (const sub of product?.subProducts || []) {
        for (const size of sub.sizes || []) {
            const price = applyDiscount(size.price, sub.discount || 0);

            if (!best || price < best.price) {
                best = { price, listPrice: size.price, discount: sub.discount || 0 };
            }
        }
    }

    return best || { price: 0, listPrice: 0, discount: 0 };
};

export const inStock = (product: any) =>
    (product?.subProducts || []).some((sub: any) => (sub.sizes || []).some((size: any) => size.qty > 0));
