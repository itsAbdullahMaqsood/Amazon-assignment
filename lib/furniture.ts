import connectDb from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { toCardProduct } from "@/lib/recommendations";
import { placeholder } from "@/components/profile/accountLinks";

// The tiles the Furniture storefront carries, in Amazon's own order and with its
// own wording. Every tile names an `art` key, which components/furniture/art.tsx
// turns into a composed stand-in: Amazon's photography is not reproduced here.
export type Tile = {
    label: string;
    art: string;
    // A room or style tile filters this storefront; everything else hands off to
    // the catalog search the way Amazon's tiles hand off to /s.
    room?: string;
    style?: string;
    search?: string;
    href?: string;
};

export const furnitureSlug = (value: string) =>
    value
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

// The department strip that runs above the storefront on every Amazon Home page.
export const departments: Tile[] = [
    { label: "Furniture", art: "furniture", href: "/furniture" },
    { label: "Shop all Home", art: "home", href: placeholder("Shop all Home") },
    { label: "Decor", art: "decor", href: placeholder("Amazon Home Decor") },
    { label: "Kitchen & dining", art: "kitchen", room: "Kitchen & dining" },
    { label: "Bedding & bath", art: "bedding", href: placeholder("Bedding & bath") },
    { label: "Storage & organization", art: "storage", href: placeholder("Storage & organization") },
    { label: "Garden & outdoor", art: "garden", room: "Outdoors" },
    { label: "Home Improvement", art: "tools", href: placeholder("Home Improvement") },
    { label: "Arts & crafts", art: "crafts", href: placeholder("Arts & crafts") },
    { label: "Amazon Home Kids", art: "kids", room: "Baby & kids" },
];

export const categories: Tile[] = [
    { label: "Sofas", art: "sofa", search: "sofa" },
    { label: "Sectionals", art: "sectional", search: "sofa" },
    { label: "Armchairs", art: "armchair", search: "chair" },
    { label: "Headboards", art: "headboard", search: "bed" },
    { label: "Beds", art: "bed", search: "bed" },
    { label: "Desks", art: "desk", search: "table" },
    { label: "Accent tables", art: "accentTable", search: "table" },
    { label: "Mattresses", art: "mattress", search: "bed" },
    { label: "Office chairs", art: "officeChair", search: "chair" },
    { label: "Outdoor seating", art: "outdoorSeating", search: "swing" },
    { label: "Barstools", art: "barstool", search: "stool" },
    { label: "Ottomans", art: "ottoman", search: "ottoman" },
];

export const rooms: Tile[] = [
    { label: "Living room", art: "livingRoom", room: "Living room" },
    { label: "Bedroom", art: "bedroom", room: "Bedroom" },
    { label: "Bathroom", art: "bathroom", room: "Bathroom" },
    { label: "Kitchen & dining", art: "kitchenDining", room: "Kitchen & dining" },
    { label: "Entryway", art: "entryway", room: "Entryway" },
    { label: "Home office", art: "homeOffice", room: "Home office" },
    { label: "Baby & kids", art: "babyKids", room: "Baby & kids" },
    { label: "Outdoors", art: "outdoors", room: "Outdoors" },
    { label: "Small spaces", art: "smallSpaces", room: "Small spaces" },
];

// Amazon's style facet. The storefront rotates this strip in and out of the
// Furniture page; it is kept here permanently, under "Shop by room".
export const styles: Tile[] = [
    { label: "Modern", art: "modern", style: "Modern" },
    { label: "Mid-century modern", art: "midCentury", style: "Mid-century modern" },
    { label: "Farmhouse", art: "farmhouse", style: "Farmhouse" },
    { label: "Boho", art: "boho", style: "Boho" },
    { label: "Coastal", art: "coastal", style: "Coastal" },
    { label: "Industrial", art: "industrial", style: "Industrial" },
    { label: "Traditional", art: "traditional", style: "Traditional" },
    { label: "Scandinavian", art: "scandinavian", style: "Scandinavian" },
    { label: "Glam", art: "glam", style: "Glam" },
];

export const moreCategories: Tile[] = [
    { label: "Dressers", art: "dresser", search: "table" },
    { label: "Coffee tables", art: "coffeeTable", search: "table" },
    { label: "TV stands & centers", art: "tvStand", search: "table" },
    { label: "Nightstands", art: "nightstand", search: "bedside" },
    { label: "Dining chairs", art: "diningChair", search: "chair" },
    { label: "Vanities", art: "vanity", search: "sink" },
    { label: "Dining tables", art: "diningTable", search: "table" },
    { label: "Outdoor dining", art: "outdoorDining", search: "tray" },
    { label: "Bean bags", art: "beanBag", search: "chair" },
    { label: "Bookcases", art: "bookcase", search: "rack" },
    { label: "Decorative shelving", art: "shelving", search: "rack" },
    { label: "Hammocks", art: "hammock", search: "swing" },
];

// Partner names stay as plain text wordmarks rather than reproduced logos.
export const brands = [
    "Safavieh",
    "Nap Queen",
    "Zinus",
    "Nathan James",
    "Walker Edison",
    "Christopher Knight",
];

const detail = (product: any, name: string) =>
    (product.details || []).find((entry: any) => entry.name === name)?.value || "";

// The whole storefront in one read: the deals strip, plus every product shaped
// for a card and tagged with the room and style its tiles filter on.
export const getFurnitureStorefront = async () => {
    await connectDb();

    const category: any = await Category.findOne({ slug: "furniture" }).lean();

    if (!category) {
        return null;
    }

    const products = await Product.find({ category: category._id })
        .sort({ "subProducts.sold": -1 })
        .lean();

    const cards = products.map((product: any) => ({
        ...toCardProduct(product),
        room: detail(product, "Room"),
        style: detail(product, "Style"),
        tileCategory: detail(product, "Category"),
    }));

    return {
        categoryId: String(category._id),
        total: cards.length,
        products: cards,
        // Amazon's "Featured deals" row is the discounted end of the store.
        deals: cards.filter((card: any) => card.discount > 0).slice(0, 12),
    };
};

// A room or style tile renders the same grid, filtered on the detail the seed
// wrote. The label is matched case-insensitively so a hand-typed URL still works.
export const filterProducts = (products: any[], room?: string, style?: string) => {
    const wanted = (value: string, against?: string) =>
        !against || furnitureSlug(value || "") === furnitureSlug(against);

    return products.filter(
        (product) => wanted(product.room, room) && wanted(product.style, style)
    );
};

export const labelFor = (tiles: Tile[], slug?: string) =>
    tiles.find((tile) => furnitureSlug(tile.room || tile.style || "") === furnitureSlug(slug || ""))
        ?.label || "";
