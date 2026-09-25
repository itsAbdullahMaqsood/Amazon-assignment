import connectDb from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { toCardProduct } from "@/lib/recommendations";

export const homeSlug = (value: string) =>
    String(value || "")
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

const detail = (product: any, name: string) =>
    (product.details || []).find((entry: any) => entry.name === name)?.value || "";

// A facet built from what the catalogue holds: every value that appears, how
// many products carry it, and a photo of one of those products to stand for it.
// A room with nothing in it never becomes a tile, so no tile can lead nowhere.
const facetOf = (cards: any[], key: string) => {
    const values: any[] = [];

    for (const card of cards) {
        const name = card[key];

        if (!name) continue;

        const found = values.find((entry) => entry.name === name);

        if (found) {
            found.count += 1;
            found.image = found.image || card.image;
        } else {
            values.push({ name, slug: homeSlug(name), count: 1, image: card.image });
        }
    }

    return values.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

// Markaz Home is the Home & Kitchen department seen by room and by style, the
// two things the catalogue records about a piece of furniture that a search box
// cannot ask for.
export const getHome = async ({ room = "", style = "", deals = false } = {}) => {
    await connectDb();

    const category: any = await Category.findOne({ slug: "furniture" }).select("_id name").lean();

    if (!category) {
        return null;
    }

    const products: any[] = await Product.find({ category: category._id })
        .sort({ "subProducts.sold": -1, rating: -1 })
        .lean();

    const cards = products.map((product: any) => ({
        ...toCardProduct(product),
        room: detail(product, "Room"),
        style: detail(product, "Style"),
    }));

    const rooms = facetOf(cards, "room");
    const currentRoom = rooms.find((entry) => entry.slug === room) || null;

    // Styles are counted inside the room being looked at, so a style chip never
    // offers a combination the shop cannot fill.
    const inRoom = cards.filter((card: any) => (currentRoom ? card.room === currentRoom.name : true));
    const styles = facetOf(inRoom, "style");
    const currentStyle = styles.find((entry) => entry.slug === style) || null;

    const shown = inRoom
        .filter((card: any) => (currentStyle ? card.style === currentStyle.name : true))
        .filter((card: any) => (deals ? card.discount > 0 : true));

    return JSON.parse(
        JSON.stringify({
            department: { name: category.name, slug: "furniture" },
            rooms,
            styles,
            room: currentRoom,
            style: currentStyle,
            deals,
            dealCount: inRoom.filter((card: any) => card.discount > 0).length,
            products: shown,
            total: cards.length,
        })
    );
};
