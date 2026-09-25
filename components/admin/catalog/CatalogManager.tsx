"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import slugify from "slugify";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckIcon, PencilSquareIcon, PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { useAppDispatch } from "@/redux/hooks";
import { showDialog } from "@/redux/slices/DialogSlice";
import { Badge, EmptyState, btn, field, table } from "@/components/admin/ui";
import { adminRequest, formatDate } from "./api";

// One inline-editing table for both Categories and Sub-Categories; the only
// differences are the parent column and which counts block a delete.
const config: any = {
    category: {
        noun: "category",
        Noun: "Category",
        url: "/api/admin/category",
        listKey: "categories",
    },
    subcategory: {
        noun: "sub-category",
        Noun: "Sub-category",
        url: "/api/admin/subcategory",
        listKey: "subCategories",
    },
};

const nameRule = (noun: string) =>
    z
        .string()
        .trim()
        .min(2, `A ${noun} name must be between 2 and 32 characters.`)
        .max(32, `A ${noun} name must be between 2 and 32 characters.`);

const small = "h-9";

const CatalogManager = ({ kind, initial, parents = [] }: any) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { noun, Noun, url, listKey } = config[kind];
    const isSub = kind === "subcategory";

    // The latest list from a mutation, tagged with the server list it replaced.
    // Once router.refresh() delivers a newer server list, that one wins again,
    // which avoids copying props into state inside an effect.
    const [local, setLocal] = useState<any>(null);
    const rows = local && local.from === initial ? local.list : initial;

    const [status, setStatus] = useState<string>("");
    const [parentFilter, setParentFilter] = useState<string>("");
    const [editing, setEditing] = useState<any>(null); // { id, name, parent, error }
    const [confirming, setConfirming] = useState<string>("");
    const [busy, setBusy] = useState<string>("");

    const schema = z.object({
        name: nameRule(noun),
        parent: isSub ? z.string().min(1, "Choose a parent category.") : z.string().optional(),
    });

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { name: "", parent: "" },
    });

    const applyList = (data: any, message: string) => {
        setLocal({ from: initial, list: data[listKey] });
        setStatus(message);
        router.refresh();
    };

    const create = async (values: any) => {
        const { data, error } = await adminRequest("post", url, values);

        if (error) {
            setError("name", { message: error });
            return;
        }

        reset({ name: "", parent: values.parent });
        applyList(data, data.message);
    };

    const startEdit = (row: any) => {
        setConfirming("");
        setEditing({ id: row._id, name: row.name, parent: row.parent?._id || "", error: "" });
    };

    const saveEdit = async () => {
        if (!editing || busy) return;

        const check = schema.safeParse(editing);
        if (!check.success) {
            setEditing({ ...editing, error: check.error.issues[0]?.message });
            return;
        }

        setBusy(editing.id);
        const { data, error } = await adminRequest("put", url, {
            id: editing.id,
            name: editing.name,
            parent: editing.parent,
        });
        setBusy("");

        if (error) {
            setEditing({ ...editing, error });
            return;
        }

        setEditing(null);
        applyList(data, data.message);
    };

    const editKeys = (e: any) => {
        if (e.key === "Enter") {
            e.preventDefault();
            saveEdit();
        } else if (e.key === "Escape") {
            e.preventDefault();
            setEditing(null);
        }
    };

    const remove = async (row: any) => {
        setBusy(row._id);
        const { data, error } = await adminRequest("delete", url, { id: row._id });
        setBusy("");
        setConfirming("");

        if (error) {
            dispatch(showDialog({ header: `Can't delete ${row.name}`, msgs: [{ msg: error, type: "error" }] }));
            return;
        }

        applyList(data, data.message);
    };

    const visible = isSub && parentFilter ? rows.filter((row: any) => row.parent?._id === parentFilter) : rows;

    return (
        <div className="space-y-4">
            <form
                onSubmit={handleSubmit(create)}
                noValidate
                className="bg-white rounded-xl border border-slate-200 p-4"
                aria-label={`Add a ${noun}`}
            >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                        <label htmlFor={`${kind}-new-name`} className="sr-only">
                            New {noun} name
                        </label>
                        <input
                            id={`${kind}-new-name`}
                            {...register("name")}
                            placeholder={`New ${noun} name`}
                            maxLength={40}
                            autoComplete="off"
                            aria-invalid={errors.name ? true : undefined}
                            aria-describedby={errors.name ? `${kind}-new-error` : undefined}
                            className={field}
                        />
                    </div>

                    {isSub && (
                        <div className="sm:w-56">
                            <label htmlFor={`${kind}-new-parent`} className="sr-only">
                                Parent category
                            </label>
                            <select
                                id={`${kind}-new-parent`}
                                {...register("parent")}
                                aria-invalid={errors.parent ? true : undefined}
                                aria-describedby={errors.parent ? `${kind}-new-error` : undefined}
                                className={field}
                            >
                                <option value="">Parent category…</option>
                                {parents.map((parent: any) => (
                                    <option key={parent._id} value={parent._id}>
                                        {parent.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button type="submit" disabled={isSubmitting} className={btn.primary}>
                        <PlusIcon className="w-4 h-4" />
                        {isSubmitting ? "Adding…" : `Add ${noun}`}
                    </button>
                </div>

                {(errors.name || errors.parent) && (
                    <p id={`${kind}-new-error`} role="alert" className="text-sm text-red-700 mt-2">
                        {String(errors.name?.message || errors.parent?.message)}
                    </p>
                )}
            </form>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600" aria-live="polite">
                    {status || `${rows.length} ${rows.length === 1 ? noun : noun.replace(/y$/, "ies")}`}
                </p>

                {isSub && (
                    <div className="flex items-center gap-2">
                        <label htmlFor="sub-filter" className="text-sm text-slate-700 whitespace-nowrap">
                            Parent
                        </label>
                        <select
                            id="sub-filter"
                            value={parentFilter}
                            onChange={(e) => setParentFilter(e.target.value)}
                            className={`${field} ${small} w-48`}
                        >
                            <option value="">All categories</option>
                            {parents.map((parent: any) => (
                                <option key={parent._id} value={parent._id}>
                                    {parent.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className={table.wrap}>
                <table className={table.table}>
                    <thead className={table.head}>
                        <tr>
                            <th scope="col" className={table.th}>Name</th>
                            {isSub && <th scope="col" className={table.th}>Parent</th>}
                            <th scope="col" className={table.th}>Slug</th>
                            {!isSub && <th scope="col" className={`${table.th} text-right`}>Sub-categories</th>}
                            <th scope="col" className={`${table.th} text-right`}>Products</th>
                            <th scope="col" className={table.th}>Created</th>
                            <th scope="col" className={`${table.th} text-right`}>
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {visible.length === 0 && (
                            <tr>
                                <td colSpan={6}>
                                    <EmptyState title={parentFilter ? `No sub-categories under this category` : `No ${noun.replace(/y$/, "ies")} yet`}>
                                        {parentFilter ? "Pick another parent, or add one above." : "Add the first one with the form above."}
                                    </EmptyState>
                                </td>
                            </tr>
                        )}

                        {visible.map((row: any) => {
                            const isEditing = editing?.id === row._id;
                            const inUse = isSub ? row.productCount > 0 : row.subCount + row.productCount > 0;

                            return (
                                <tr key={row._id} className={`${table.row} ${isEditing ? "bg-amber-50/40" : ""}`}>
                                    {isEditing ? (
                                        <>
                                            <td className={`${table.td} min-w-52`} colSpan={isSub ? 2 : 1}>
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <label htmlFor={`edit-name-${row._id}`} className="sr-only">
                                                        {Noun} name
                                                    </label>
                                                    <input
                                                        id={`edit-name-${row._id}`}
                                                        value={editing.name}
                                                        onChange={(e) => setEditing({ ...editing, name: e.target.value, error: "" })}
                                                        onKeyDown={editKeys}
                                                        maxLength={40}
                                                        autoFocus
                                                        aria-invalid={editing.error ? true : undefined}
                                                        aria-describedby={editing.error ? `edit-error-${row._id}` : undefined}
                                                        className={`${field} ${small} min-w-40`}
                                                    />
                                                    {isSub && (
                                                        <>
                                                            <label htmlFor={`edit-parent-${row._id}`} className="sr-only">
                                                                Parent category
                                                            </label>
                                                            <select
                                                                id={`edit-parent-${row._id}`}
                                                                value={editing.parent}
                                                                onChange={(e) => setEditing({ ...editing, parent: e.target.value, error: "" })}
                                                                onKeyDown={editKeys}
                                                                className={`${field} ${small} min-w-36`}
                                                            >
                                                                <option value="">Parent category…</option>
                                                                {parents.map((parent: any) => (
                                                                    <option key={parent._id} value={parent._id}>
                                                                        {parent.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </>
                                                    )}
                                                </div>
                                                {editing.error && (
                                                    <p id={`edit-error-${row._id}`} role="alert" className="text-xs text-red-700 mt-1">
                                                        {editing.error}
                                                    </p>
                                                )}
                                            </td>
                                            <td className={`${table.td} text-slate-500 font-mono text-xs`}>
                                                <span className="sr-only">New slug: </span>
                                                {slugPreview(editing.name)}
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <th scope="row" className={`${table.td} font-medium text-fg whitespace-nowrap`}>
                                                {row.name}
                                            </th>
                                            {isSub && (
                                                <td className={`${table.td} whitespace-nowrap`}>
                                                    {row.parent ? row.parent.name : <Badge tone="red">Missing</Badge>}
                                                </td>
                                            )}
                                            <td className={`${table.td} text-slate-500 font-mono text-xs whitespace-nowrap`}>
                                                {row.slug}
                                            </td>
                                        </>
                                    )}

                                    {!isSub && <td className={`${table.td} text-right tabular-nums`}>{row.subCount}</td>}
                                    <td className={`${table.td} text-right tabular-nums`}>
                                        {row.productCount > 0 && !isSub ? (
                                            <Link
                                                href={`/browse?category=${row.slug}`}
                                                className="text-accent-ink hover:underline outline-none focus-visible:ring-2 focus-visible:ring-accent-ink rounded"
                                            >
                                                {row.productCount}
                                            </Link>
                                        ) : (
                                            row.productCount
                                        )}
                                    </td>
                                    <td className={`${table.td} whitespace-nowrap text-slate-600`}>{formatDate(row.createdAt)}</td>

                                    <td className={`${table.td} text-right whitespace-nowrap`}>
                                        {isEditing ? (
                                            <div className="inline-flex gap-1">
                                                <button
                                                    type="button"
                                                    onClick={saveEdit}
                                                    disabled={busy === row._id}
                                                    className={`${btn.primary} ${small} px-3`}
                                                >
                                                    <CheckIcon className="w-4 h-4" />
                                                    {busy === row._id ? "Saving…" : "Save"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditing(null)}
                                                    className={`${btn.secondary} ${small} px-3`}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : confirming === row._id ? (
                                            <div className="inline-flex items-center gap-1" role="group" aria-label={`Confirm deleting ${row.name}`}>
                                                <span className="text-xs text-slate-700 mr-1">Delete {row.name}?</span>
                                                <button
                                                    type="button"
                                                    onClick={() => remove(row)}
                                                    disabled={busy === row._id}
                                                    className={`${btn.danger} ${small} px-3`}
                                                >
                                                    {busy === row._id ? "Deleting…" : "Delete"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirming("")}
                                                    className={`${btn.secondary} ${small} px-3`}
                                                    aria-label="Keep it"
                                                >
                                                    <XMarkIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="inline-flex gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => startEdit(row)}
                                                    className={btn.icon}
                                                    aria-label={`Edit ${row.name}`}
                                                    title="Edit"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditing(null);
                                                        setConfirming(row._id);
                                                    }}
                                                    className={`${btn.icon} hover:text-red-700`}
                                                    aria-label={`Delete ${row.name}`}
                                                    title={inUse ? "In use — delete will explain what still uses it" : "Delete"}
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <p className="text-xs text-slate-500">
                Tip: Enter saves an edit, Escape cancels. The slug is regenerated from the name on every rename.
            </p>
        </div>
    );
};

// The same call the server makes, so the preview is the slug that will be saved.
const slugPreview = (name: string) => slugify(String(name), { lower: true, strict: true });

export default CatalogManager;
