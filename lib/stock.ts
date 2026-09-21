// Payment consumes stock and an admin cancellation gives it back, so both go
// through the same variant lookup — two copies of it would eventually disagree
// about which variant a line came from.

// An order line's image is the variant's own first image, which identifies the
// variant exactly; colour hex alone can collide between variants.
export const findVariant = (product: any, line: any) =>
    product.subProducts.find((sub: any) => sub.images?.[0]?.url === line.image) ||
    product.subProducts.find(
        (sub: any) =>
            sub.color?.color === line.color?.color &&
            (sub.color?.image || "") === (line.color?.image || "")
    ) ||
    product.subProducts.find((sub: any) => sub.sizes.some((size: any) => size.size === line.size));

// direction -1 takes stock (payment), +1 puts it back (cancelling a paid order).
export const adjustStock = async (Product: any, order: any, direction: 1 | -1) => {
    for (const line of order.products) {
        const product: any = await Product.findById(line.product);

        if (!product) {
            continue;
        }

        const subProduct = findVariant(product, line);
        const sizeRow = subProduct?.sizes.find((size: any) => size.size === line.size);

        if (!sizeRow) {
            continue;
        }

        // Payment (-1): qty goes down, sold goes up. Cancel (+1): the reverse.
        sizeRow.qty = Math.max(0, sizeRow.qty + direction * line.qty);
        subProduct.sold = Math.max(0, (subProduct.sold || 0) - direction * line.qty);

        await product.save();
    }
};
