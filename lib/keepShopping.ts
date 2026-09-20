import { toCardProduct } from "@/lib/recommendations";
import { parsePriceRange } from "@/components/keepShopping/filters";

// Amazon rounds the month's sales down to a blunt milestone rather than printing
// the real figure.
export const boughtLabel = (sold: number) => {
    if (sold >= 10000) return `${Math.floor(sold / 10000) * 10}K+ bought in past month`;
    if (sold >= 1000) return `${Math.floor(sold / 1000)}K+ bought in past month`;
    if (sold >= 100) return `${Math.floor(sold / 100) * 100}+ bought in past month`;
    if (sold >= 50) return "50+ bought in past month";
    return "";
};

// Every colour variant of a listing, carrying the price it charges, so a swatch
// click can repaint the card without another round trip.
const toStyle = (sub: any, index: number) => {
    const prices = (sub.sizes || [])
        .map((size: any) => size.price)
        .sort((a: number, b: number) => a - b);
    const listPrice = prices[0] || 0;
    const discount = sub.discount || 0;

    return {
        style: index,
        color: sub.color?.color || "",
        colorImage: sub.color?.image || "",
        image: sub.images?.[0]?.url || "",
        listPrice,
        discount,
        price:
            discount > 0
                ? Number((listPrice - (listPrice * discount) / 100).toFixed(2))
                : listPrice,
    };
};

// The card shape this page renders: the shared recommendation card plus the
// swatch rail, the brand line and the "bought in past month" proof.
export const toKeepShoppingProduct = (product: any, style = 0) => {
    const styles = (product.subProducts || []).map(toStyle);
    const card = toCardProduct(product);
    const active = styles[style] || styles[0] || null;

    return {
        ...card,
        brand: product.brand || "",
        styles,
        style: active ? active.style : 0,
        image: active?.image || card.image,
        price: active?.price ?? card.price,
        listPrice: active?.listPrice ?? card.listPrice,
        discount: active?.discount ?? card.discount,
        limitedDeal: (active?.discount || 0) > 0,
        bought: boughtLabel(card.sold),
    };
};

// The price filter runs on the shaped card, not on the query: Mongo would match
// any size row of any colour variant, and the figure on the card is one variant's
// price after its discount.
export const withinPrice = (value: string) => {
    const { min, max } = parsePriceRange(value);

    return (card: any) =>
        (min === undefined || card.price >= min) && (max === undefined || card.price <= max);
};
