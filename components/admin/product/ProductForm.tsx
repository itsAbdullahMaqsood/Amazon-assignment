"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import slugify from "slugify";
import { useFieldArray, useForm } from "react-hook-form";
import { LockClosedIcon, PlusIcon, SwatchIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

import DotLoaderSpinner from "@/components/loaders/dotLoader/DotLoaderSpinner";
import { useAppDispatch } from "@/redux/hooks";
import { showDialog } from "@/redux/slices/DialogSlice";
import { deleteImage, toUploadForm, uploadImages } from "@/request/upload";
import { checkProduct, emptyDetail, emptyQuestion, emptySize, MIN_IMAGES } from "@/lib/productForm";
import { Panel, btn, field, label } from "@/components/admin/ui";
import ImageListField, { screenFiles, toLocalItems, toRemoteItems } from "./ImageListField";

// Detail names /browse filters on, offered as suggestions.
const DETAIL_NAMES = ["Style", "Material", "Gender", "Fit", "Pattern", "Occasion", "Care", "Model"];

const blank = {
    name: "",
    description: "",
    brand: "",
    category: "",
    subCategories: [] as string[],
    shipping: "0",
    sku: "",
    discount: "0",
    color: "#121a27",
    sizes: [{ ...emptySize }],
    details: [{ ...emptyDetail }],
    questions: [{ ...emptyQuestion }],
};

const RowButton = ({ onClick, label: text, disabled }: any) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={text}
        title={text}
        className={btn.icon}
    >
        <TrashIcon className="w-5 h-5" />
    </button>
);

const ProductForm = ({ mode = "create", categories, subCategories, parents = [], initial }: any) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const editing = mode === "edit";

    const [variantMode, setVariantMode] = useState<boolean>(false);
    const [parent, setParent] = useState<any>(null);
    const [parentFilter, setParentFilter] = useState<string>("");
    const [saving, setSaving] = useState<string>("");

    const [images, setImageState] = useState<any[]>(toRemoteItems(initial?.variant?.images));
    const [descImages, setDescState] = useState<any[]>(toRemoteItems(initial?.variant?.description_images));
    const [swatch, setSwatchState] = useState<any>(
        initial?.variant?.color?.image
            ? { kind: "remote", url: initial.variant.color.image, preview: initial.variant.color.image }
            : null
    );

    // Local previews are object URLs; this mirror (written only from handlers)
    // lets the unmount cleanup release them.
    const live = useRef<any>({ images: [], descImages: [], swatch: null });
    const setImages = (next: any[]) => {
        live.current.images = next;
        setImageState(next);
    };
    const setDescImages = (next: any[]) => {
        live.current.descImages = next;
        setDescState(next);
    };
    const setSwatch = (next: any) => {
        live.current.swatch = next;
        setSwatchState(next);
    };

    useEffect(
        () => () => {
            const all = [...live.current.images, ...live.current.descImages, live.current.swatch];
            all.filter((item) => item?.kind === "local").forEach((item) => URL.revokeObjectURL(item.preview));
        },
        []
    );

    const { register, control, getValues, setValue, watch, reset } = useForm({
        defaultValues: initial
            ? {
                  ...blank,
                  ...initial.shared,
                  shipping: String(initial.shared.shipping ?? 0),
                  sku: initial.variant.sku || "",
                  discount: String(initial.variant.discount ?? 0),
                  color: initial.variant.color?.color || blank.color,
                  sizes: initial.variant.sizes?.length ? initial.variant.sizes : blank.sizes,
                  details: initial.shared.details?.length ? initial.shared.details : blank.details,
                  questions: initial.shared.questions?.length ? initial.shared.questions : blank.questions,
              }
            : blank,
    });

    const sizes = useFieldArray({ control, name: "sizes" });
    const details = useFieldArray({ control, name: "details" });
    const questions = useFieldArray({ control, name: "questions" });

    const category = watch("category");
    const chosenSubs: string[] = watch("subCategories") || [];
    const color = watch("color");

    const locked = variantMode && Boolean(parent);
    const visibleSubs = subCategories.filter((sub: any) => String(sub.parent) === String(category));
    const shownParents = parents.filter((p: any) =>
        p.name.toLowerCase().includes(parentFilter.trim().toLowerCase())
    );

    const reject = (msgs: string[]) =>
        dispatch(showDialog({ header: "Some images were not added", msgs: msgs.map((msg) => ({ msg, type: "error" })) }));

    const onCategory = (value: string) => {
        setValue("category", value);
        // Sub-categories from another category cannot stay selected.
        setValue(
            "subCategories",
            chosenSubs.filter((id) =>
                subCategories.some((sub: any) => String(sub._id) === id && String(sub.parent) === value)
            )
        );
    };

    const toggleSub = (id: string) =>
        setValue(
            "subCategories",
            chosenSubs.includes(id) ? chosenSubs.filter((entry) => entry !== id) : [...chosenSubs, id]
        );

    const chooseParent = async (id: string) => {
        if (!id) {
            setParent(null);
            reset({ ...blank, color: getValues("color") });
            return;
        }

        try {
            const { data } = await axios.get(`/api/admin/product/${id}`);

            setParent(data);
            // Shared fields come from the parent and are locked; the variant
            // fields the admin already filled in are kept.
            reset({
                ...getValues(),
                name: data.name,
                description: data.description,
                brand: data.brand,
                category: data.category,
                subCategories: data.subCategories,
                shipping: String(data.shipping),
                details: data.details.length ? data.details : blank.details,
                questions: data.questions.length ? data.questions : blank.questions,
            });
        } catch (error: any) {
            dispatch(
                showDialog({
                    header: "Could not load that product",
                    msgs: [{ msg: error.response?.data?.message || error.message, type: "error" }],
                })
            );
        }
    };

    const switchMode = (next: boolean) => {
        setVariantMode(next);
        setParent(null);
        setParentFilter("");

        if (!next) {
            reset({ ...blank, color: getValues("color") });
        }
    };

    const submit = async (event: any) => {
        event.preventDefault();

        const values: any = getValues();

        if (variantMode && !parent) {
            dispatch(
                showDialog({
                    header: "Choose a product first",
                    msgs: [{ msg: "Pick the product this new colour belongs to.", type: "error" }],
                })
            );
            return;
        }

        // Every rule is reported, passes and failures together, and nothing is
        // uploaded until all of them pass.
        const results = checkProduct(
            { ...values, hasColorImage: Boolean(swatch) },
            { imageCount: images.length, variantMode: locked }
        );

        if (variantMode && parent?.colors?.some((c: string) => c.toLowerCase() === String(values.color).toLowerCase())) {
            results.push({ msg: "This product already has a variant in that colour.", type: "error" });
        }

        if (results.some((result) => result.type === "error")) {
            dispatch(showDialog({ header: "Please check the product", msgs: results }));
            return;
        }

        const folder = `products/${
            slugify(locked ? parent.slug : values.name, { lower: true, strict: true }).slice(0, 60) || "product"
        }`;
        const uploaded: any[] = [];

        // Uploads the local items of a list in their current order and returns
        // the whole list as { url, public_url } in that same order.
        const resolveList = async (list: any[]) => {
            const local = list.filter((item) => item.kind === "local");
            const done = local.length
                ? await uploadImages(toUploadForm(local.map((item) => item.file), folder))
                : [];

            uploaded.push(...done);

            let next = 0;

            return list.map((item) =>
                item.kind === "local" ? done[next++] : { url: item.url, public_url: item.public_url }
            );
        };

        try {
            setSaving("Uploading images…");

            const productImages = await resolveList(images);
            const descriptionImages = await resolveList(descImages);
            const swatchImage =
                swatch.kind === "local" ? (await resolveList([swatch]))[0].url : swatch.url;

            setSaving(editing ? "Saving…" : "Publishing…");

            const body = {
                ...values,
                parent: locked ? parent._id : undefined,
                style: initial?.style,
                images: productImages,
                description_images: descriptionImages,
                color: { color: values.color, image: swatchImage },
            };

            const { data } = editing
                ? await axios.put(`/api/admin/product/${initial.productId}`, body)
                : await axios.post("/api/admin/product", body);

            dispatch(
                showDialog({
                    header: editing ? "Product saved" : locked ? "Colour added" : "Product published",
                    msgs: [
                        { msg: data.message, type: "success" },
                        ...results.filter((result) => result.type === "success"),
                    ],
                })
            );

            if (editing) {
                router.refresh();
            } else {
                router.push(`/admin/dashboard/product?created=${data.product.slug}`);
            }
        } catch (error: any) {
            // Nothing half-saved: whatever reached Cloudinary for this attempt is
            // taken back out.
            await Promise.allSettled(uploaded.map((image) => deleteImage(image.public_url)));

            const messages = error.response?.data?.messages || [error.response?.data?.message || error.message];

            dispatch(
                showDialog({
                    header: "The product was not saved",
                    msgs: messages.map((msg: string) => ({ msg, type: "error" })),
                })
            );
        } finally {
            setSaving("");
        }
    };

    return (
        <form onSubmit={submit} noValidate className="space-y-6">
            {saving && <DotLoaderSpinner loading />}

            {!editing && (
                <Panel title="What are you adding?">
                    <div className="grid sm:grid-cols-2 gap-3" role="radiogroup" aria-label="What are you adding?">
                        {[
                            { value: false, title: "A new product", text: "A new listing with its first colour." },
                            {
                                value: true,
                                title: "A colour of an existing product",
                                text: "Adds a variant; name, category and details come from the product.",
                            },
                        ].map((option) => (
                            <button
                                key={String(option.value)}
                                type="button"
                                role="radio"
                                aria-checked={variantMode === option.value}
                                onClick={() => switchMode(option.value)}
                                className={`text-left rounded-xl border p-4 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent-ink ${
                                    variantMode === option.value
                                        ? "border-accent-ink bg-accent-soft/60 ring-1 ring-accent-ink"
                                        : "border-line hover:border-line"
                                }`}
                            >
                                <p className="font-semibold text-sm">{option.title}</p>
                                <p className="text-xs text-fg-muted mt-1">{option.text}</p>
                            </button>
                        ))}
                    </div>

                    {variantMode && (
                        <div className="grid sm:grid-cols-2 gap-3 mt-4">
                            <div>
                                <label htmlFor="parent-filter" className={label}>
                                    Find the product
                                </label>
                                <input
                                    id="parent-filter"
                                    value={parentFilter}
                                    onChange={(event) => setParentFilter(event.target.value)}
                                    placeholder="Type to filter…"
                                    className={field}
                                />
                            </div>
                            <div>
                                <label htmlFor="parent" className={label}>
                                    Parent product
                                </label>
                                <select
                                    id="parent"
                                    value={parent?._id || ""}
                                    onChange={(event) => chooseParent(event.target.value)}
                                    className={field}
                                >
                                    <option value="">Choose a product ({shownParents.length})</option>
                                    {shownParents.map((p: any) => (
                                        <option key={p._id} value={p._id}>
                                            {p.name} — {p.variants} colour{p.variants === 1 ? "" : "s"}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </Panel>
            )}

            <Panel
                title="Product information"
                action={
                    locked && (
                        <span className="inline-flex items-center gap-1 text-xs text-fg-subtle">
                            <LockClosedIcon className="w-4 h-4" />
                            From &ldquo;{parent.name}&rdquo;
                        </span>
                    )
                }
            >
                <fieldset disabled={locked} className="grid md:grid-cols-2 gap-4 disabled:opacity-70">
                    <div className="md:col-span-2">
                        <label htmlFor="name" className={label}>
                            Product name
                        </label>
                        <input id="name" {...register("name")} maxLength={120} className={field} />
                    </div>

                    <div>
                        <label htmlFor="brand" className={label}>
                            Brand
                        </label>
                        <input id="brand" {...register("brand")} maxLength={60} className={field} />
                    </div>

                    <div>
                        <label htmlFor="shipping" className={label}>
                            Shipping fee ($)
                        </label>
                        <input id="shipping" type="number" min={0} step="0.01" {...register("shipping")} className={field} />
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="description" className={label}>
                            Description
                        </label>
                        <textarea
                            id="description"
                            rows={4}
                            {...register("description")}
                            className={`${field} h-auto py-2`}
                        />
                    </div>

                    <div>
                        <label htmlFor="category" className={label}>
                            Category
                        </label>
                        <select
                            id="category"
                            value={category}
                            onChange={(event) => onCategory(event.target.value)}
                            className={field}
                        >
                            <option value="">Choose a category</option>
                            {categories.map((c: any) => (
                                <option key={c._id} value={c._id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <fieldset>
                        <legend className={label}>Sub-categories</legend>
                        {!category ? (
                            <p className="text-sm text-fg-subtle h-10 flex items-center">Choose a category first.</p>
                        ) : visibleSubs.length === 0 ? (
                            <p className="text-sm text-fg-subtle h-10 flex items-center">
                                This category has no sub-categories.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {visibleSubs.map((sub: any) => {
                                    const on = chosenSubs.includes(String(sub._id));

                                    return (
                                        <label
                                            key={sub._id}
                                            className={`inline-flex items-center gap-2 h-9 px-3 rounded-full border text-sm cursor-pointer ${
                                                on ? "border-accent-ink bg-accent-soft text-accent-ink" : "border-line"
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={on}
                                                onChange={() => toggleSub(String(sub._id))}
                                                className="accent-accent-ink"
                                            />
                                            {sub.name}
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </fieldset>
                </fieldset>
            </Panel>

            <Panel title={editing ? `Colour variant ${Number(initial.style) + 1} of ${initial.variantCount}` : "Colour variant"}>
                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="sku" className={label}>
                            SKU
                        </label>
                        <input id="sku" {...register("sku")} className={field} />
                    </div>

                    <div>
                        <label htmlFor="discount" className={label}>
                            Discount (%)
                        </label>
                        <input id="discount" type="number" min={0} max={99} step={1} {...register("discount")} className={field} />
                    </div>

                    <div>
                        <label htmlFor="color-hex" className={label}>
                            Colour
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                aria-label="Pick the colour"
                                value={/^#[0-9a-f]{6}$/i.test(color) ? color : "#000000"}
                                onChange={(event) => setValue("color", event.target.value)}
                                className="w-12 h-10 rounded-lg border border-line cursor-pointer p-1 bg-surface"
                            />
                            <input id="color-hex" {...register("color")} maxLength={7} className={`${field} font-mono`} />
                        </div>
                    </div>
                </div>

                <div className="mt-5">
                    <p className={label}>Style image</p>
                    <p className="text-xs text-fg-subtle">The small swatch shoppers click to choose this colour.</p>
                    <div className="flex items-center gap-3 mt-2">
                        {swatch ? (
                            <div className="relative w-16 h-16">
                                <Image
                                    src={swatch.preview}
                                    alt="Style image"
                                    fill
                                    sizes="64px"
                                    unoptimized={swatch.kind === "local"}
                                    className="rounded-full object-cover border border-line"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (swatch.kind === "local") URL.revokeObjectURL(swatch.preview);
                                        setSwatch(null);
                                    }}
                                    aria-label="Remove style image"
                                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-surface border border-line shadow flex items-center justify-center cursor-pointer"
                                >
                                    <XMarkIcon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : (
                            <span
                                aria-hidden="true"
                                className="w-16 h-16 rounded-full border border-dashed border-line flex items-center justify-center"
                                style={{ backgroundColor: /^#[0-9a-f]{6}$/i.test(color) ? color : undefined }}
                            >
                                <SwatchIcon className="w-6 h-6 text-fg-inverse mix-blend-difference" />
                            </span>
                        )}
                        <label className={`${btn.secondary} focus-within:ring-2 focus-within:ring-accent-ink`}>
                            {swatch ? "Replace" : "Upload style image"}
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="sr-only"
                                onChange={(event) => {
                                    const { ok, errors } = screenFiles([...(event.target.files || [])].slice(0, 1));

                                    if (errors.length) reject(errors);

                                    if (ok.length) {
                                        if (swatch?.kind === "local") URL.revokeObjectURL(swatch.preview);
                                        setSwatch(toLocalItems(ok)[0]);
                                    }

                                    event.target.value = "";
                                }}
                            />
                        </label>
                    </div>
                </div>

                <div className="mt-6">
                    <ImageListField
                        id="product-images"
                        label="Product images"
                        hint={`At least ${MIN_IMAGES}. Drag or use the arrows to reorder; the first image is the cover.`}
                        items={images}
                        onChange={setImages}
                        onRejected={reject}
                        cover
                    />
                </div>

                <div className="mt-6">
                    <ImageListField
                        id="description-images"
                        label="Description images"
                        hint="Optional. Shown with the product description."
                        items={descImages}
                        onChange={setDescImages}
                        onRejected={reject}
                    />
                </div>
            </Panel>

            <Panel title="Sizes, stock and price">
                <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_40px] gap-3 text-xs font-medium text-fg-subtle mb-1 px-1">
                    <span>Size</span>
                    <span>Quantity in stock</span>
                    <span>Price ($)</span>
                    <span />
                </div>
                <div className="space-y-3">
                    {sizes.fields.map((row, index) => (
                        <div key={row.id} className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_40px] gap-3 items-center">
                            <input aria-label={`Size ${index + 1}`} placeholder="e.g. M, 42, 128GB" {...register(`sizes.${index}.size`)} className={field} />
                            <input aria-label={`Quantity for size ${index + 1}`} type="number" min={0} step={1} placeholder="Qty" {...register(`sizes.${index}.qty`)} className={field} />
                            <input aria-label={`Price for size ${index + 1}`} type="number" min={0} step="0.01" placeholder="Price" {...register(`sizes.${index}.price`)} className={field} />
                            <RowButton onClick={() => sizes.remove(index)} label={`Remove size ${index + 1}`} disabled={sizes.fields.length === 1} />
                        </div>
                    ))}
                </div>
                <button type="button" onClick={() => sizes.append({ ...emptySize })} className={`${btn.secondary} mt-3`}>
                    <PlusIcon className="w-4 h-4" />
                    Add size
                </button>
            </Panel>

            <fieldset disabled={locked} className="space-y-6 disabled:opacity-70">
                <Panel title="Details" action={<span className="text-xs text-fg-subtle">Style and Material power the /browse filters</span>}>
                    <datalist id="detail-names">
                        {DETAIL_NAMES.map((entry) => (
                            <option key={entry} value={entry} />
                        ))}
                    </datalist>
                    <div className="space-y-3">
                        {details.fields.map((row, index) => (
                            <div key={row.id} className="grid grid-cols-[1fr_1fr_40px] gap-3 items-center">
                                <input aria-label={`Detail ${index + 1} name`} list="detail-names" placeholder="Name, e.g. Material" {...register(`details.${index}.name`)} className={field} />
                                <input aria-label={`Detail ${index + 1} value`} placeholder="Value, e.g. Cotton" {...register(`details.${index}.value`)} className={field} />
                                <RowButton onClick={() => details.remove(index)} label={`Remove detail ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={() => details.append({ ...emptyDetail })} className={`${btn.secondary} mt-3`}>
                        <PlusIcon className="w-4 h-4" />
                        Add detail
                    </button>
                </Panel>

                <Panel title="Questions and answers">
                    <div className="space-y-3">
                        {questions.fields.map((row, index) => (
                            <div key={row.id} className="grid md:grid-cols-[1fr_1fr_40px] gap-3 items-center">
                                <input aria-label={`Question ${index + 1}`} placeholder="Question" {...register(`questions.${index}.question`)} className={field} />
                                <input aria-label={`Answer ${index + 1}`} placeholder="Answer" {...register(`questions.${index}.answer`)} className={field} />
                                <RowButton onClick={() => questions.remove(index)} label={`Remove question ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={() => questions.append({ ...emptyQuestion })} className={`${btn.secondary} mt-3`}>
                        <PlusIcon className="w-4 h-4" />
                        Add question
                    </button>
                </Panel>
            </fieldset>

            {/* Sticky rather than fixed, so it stays inside the content column
                whether the sidebar is open, collapsed or a phone drawer. */}
            <div className="sticky bottom-0 z-20 -mx-4 md:-mx-8 bg-surface/95 backdrop-blur border-t border-line">
                <div className="px-4 md:px-8 py-3 flex flex-wrap items-center justify-end gap-3">
                    {editing && (
                        <Link href={`/product/${initial.slug}?style=${initial.style}`} target="_blank" className={btn.secondary}>
                            View on store
                        </Link>
                    )}
                    <Link href="/admin/dashboard/product" className={btn.secondary}>
                        Cancel
                    </Link>
                    <button type="submit" disabled={Boolean(saving)} className={btn.primary}>
                        {saving || (editing ? "Save changes" : locked ? "Add colour" : "Publish product")}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default ProductForm;
