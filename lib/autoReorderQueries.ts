import connectDb from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import { applyDiscount } from "@/lib/price";

// Each repeat joined to its product, priced as the catalogue prices it now, with
// what the cart needs to put it back.
export const getAutoReorder = async (userId: string) => {
    await connectDb();

    const user: any = await User.findById(userId).select("autoReorder").lean();
    const entries = user?.autoReorder || [];
    const ids = entries.map((entry: any) => String(entry.product));
    const products: any[] = ids.length
        ? await Product.find({ _id: { $in: ids } }).select("name slug subProducts").lean()
        : [];
    const byId = new Map(products.map((product) => [String(product._id), product]));

    return JSON.parse(
        JSON.stringify(
            entries
                .map((entry: any) => {
                    const product = byId.get(String(entry.product));

                    if (!product) return null;

                    const style = Number(entry.style) || 0;
                    const variant = product.subProducts?.[style] || product.subProducts?.[0] || {};
                    const sizes = variant.sizes || [];
                    const sizeIndex = entry.size ? sizes.findIndex((row: any) => row.size === entry.size) : 0;
                    const row = sizes[sizeIndex >= 0 ? sizeIndex : 0];
                    const discount = variant.discount || 0;

                    return {
                        _id: String(entry._id),
                        productId: String(product._id),
                        name: product.name,
                        slug: product.slug,
                        style,
                        size: entry.size || "",
                        image: variant.images?.[0]?.url || "",
                        everyWeeks: entry.everyWeeks,
                        nextAt: entry.nextAt,
                        price: row ? applyDiscount(row.price, discount) : null,
                        listPrice: row && discount > 0 ? row.price : null,
                        inStock: Boolean(row && row.qty > 0),
                        rebuy: row && row.qty > 0 ? { productId: String(product._id), style, size: sizeIndex >= 0 ? sizeIndex : 0 } : null,
                    };
                })
                .filter(Boolean)
                .sort((a: any, b: any) => new Date(a.nextAt).getTime() - new Date(b.nextAt).getTime())
        )
    );
};
