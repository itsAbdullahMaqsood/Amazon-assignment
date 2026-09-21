// The product form's rules, shared by the client (which reports every result in
// the dialog before anything uploads) and the server (which enforces them again
// on whatever actually arrives). Pure functions only: no mongoose, no DOM.

export const MIN_IMAGES = 3;
export const MAX_IMAGES = 10;
export const HEX = /^#[0-9a-f]{6}$/i;

export const emptySize = { size: "", qty: "", price: "" };
export const emptyDetail = { name: "", value: "" };
export const emptyQuestion = { question: "", answer: "" };

const filled = (value: any) => String(value ?? "").trim().length > 0;

// Rows a user added and left completely blank are ignored rather than rejected.
export const meaningful = (rows: any[], keys: string[]) =>
    (rows || []).filter((row) => keys.some((key) => filled(row?.[key])));

// Every rule produces a result either way, so the dialog shows what passed next
// to what did not.
export const checkProduct = (values: any, { imageCount, variantMode }: any) => {
    const results: { msg: string; type: "success" | "error" }[] = [];
    const pass = (msg: string) => results.push({ msg, type: "success" });
    const fail = (msg: string) => results.push({ msg, type: "error" });

    if (!variantMode) {
        const name = String(values.name || "").trim();

        if (name.length < 2 || name.length > 120) {
            fail("Add a product name between 2 and 120 characters.");
        } else {
            pass("Product name looks good.");
        }

        if (String(values.description || "").trim().length < 10) {
            fail("Add a description of at least 10 characters.");
        } else {
            pass("Description added.");
        }

        if (!filled(values.brand)) {
            fail("Add the brand name.");
        } else {
            pass("Brand added.");
        }

        if (!filled(values.category)) {
            fail("Choose a category.");
        } else {
            pass("Category chosen.");
        }

        const shipping = Number(values.shipping);

        if (values.shipping === "" || !Number.isFinite(shipping) || shipping < 0) {
            fail("Enter a shipping fee of 0 or more.");
        } else {
            pass(shipping === 0 ? "Ships free." : "Shipping fee set.");
        }
    }

    if (!filled(values.sku)) {
        fail("Add a SKU for this variant.");
    } else {
        pass("SKU added.");
    }

    const discount = Number(values.discount);

    if (!Number.isInteger(discount) || discount < 0 || discount > 99) {
        fail("Discount must be a whole number from 0 to 99.");
    } else {
        pass(discount ? `${discount}% discount.` : "No discount.");
    }

    if (!HEX.test(String(values.color || ""))) {
        fail("Choose a main product color.");
    } else {
        pass("Main color chosen.");
    }

    if (!values.hasColorImage) {
        fail("Choose a main product style image.");
    } else {
        pass("Style image chosen.");
    }

    if (imageCount < MIN_IMAGES) {
        fail(`Choose at least ${MIN_IMAGES} images (${MIN_IMAGES - imageCount} remaining).`);
    } else if (imageCount > MAX_IMAGES) {
        fail(`Choose at most ${MAX_IMAGES} product images.`);
    } else {
        pass(`${imageCount} product images; the first is the cover.`);
    }

    const sizes = meaningful(values.sizes, ["size", "qty", "price"]);
    const complete = sizes.every(
        (row: any) =>
            filled(row.size) &&
            Number.isInteger(Number(row.qty)) &&
            Number(row.qty) >= 0 &&
            filled(row.qty) &&
            Number(row.price) > 0
    );
    const labels = sizes.map((row: any) => String(row.size).trim().toLowerCase());

    if (sizes.length === 0 || !complete) {
        fail("Please fill all information on sizes.");
    } else if (new Set(labels).size !== labels.length) {
        fail("Each size can only be listed once.");
    } else {
        pass(`${sizes.length} size${sizes.length === 1 ? "" : "s"} with stock and price.`);
    }

    if (!variantMode) {
        const details = meaningful(values.details, ["name", "value"]);

        if (details.some((row: any) => !filled(row.name) || !filled(row.value))) {
            fail("Please fill both the name and the value on every detail.");
        } else if (details.length) {
            pass(`${details.length} detail${details.length === 1 ? "" : "s"} added.`);
        }

        const questions = meaningful(values.questions, ["question", "answer"]);

        if (questions.some((row: any) => !filled(row.question) || !filled(row.answer))) {
            fail("Please fill both the question and the answer on every question.");
        } else if (questions.length) {
            pass(`${questions.length} question${questions.length === 1 ? "" : "s"} added.`);
        }
    }

    return results;
};
