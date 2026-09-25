"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilSquareIcon, PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { useAppDispatch } from "@/redux/hooks";
import { showDialog } from "@/redux/slices/DialogSlice";
import { Badge, EmptyState, Panel, btn, field, label, table } from "@/components/admin/ui";
import { adminRequest, formatDate } from "@/components/admin/catalog/api";
import { couponSchema, couponStatus } from "./schema";

const statusTone: any = { Active: "green", Scheduled: "blue", Expired: "slate" };

const FieldError = ({ id, error }: any) =>
    error ? (
        <p id={id} role="alert" className="text-xs text-danger mt-1">
            {String(error.message)}
        </p>
    ) : null;

// `today` and the default dates come from the server, so nothing here reads the clock.
const CouponManager = ({ initial, today, defaults }: any) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const formRef = useRef<HTMLFormElement | null>(null);

    // Same pattern as the catalog tables: a mutation's list wins until the
    // refreshed server props replace it.
    const [local, setLocal] = useState<any>(null);
    const fresh = local && local.from === initial;
    const coupons = fresh ? local.list : initial;
    const now = fresh ? local.today : today;

    const [editing, setEditing] = useState<any>(null);
    const [confirming, setConfirming] = useState<string>("");
    const [busy, setBusy] = useState<string>("");
    const [status, setStatus] = useState<string>("");

    const blank = { coupon: "", discount: 10, startDate: defaults.startDate, endDate: defaults.endDate };

    const {
        register,
        handleSubmit,
        reset,
        setError,
        setFocus,
        formState: { errors, isSubmitting },
    } = useForm({ resolver: zodResolver(couponSchema), defaultValues: blank });

    const apply = (data: any) => {
        setLocal({ from: initial, list: data.coupons, today: data.today });
        setStatus(data.message);
        router.refresh();
    };

    const submit = async (values: any) => {
        const { data, error } = editing
            ? await adminRequest("put", "/api/admin/coupon", { id: editing._id, ...values })
            : await adminRequest("post", "/api/admin/coupon", values);

        if (error) {
            // Route duplicate/date errors to the field they are about.
            const target = /date/i.test(error) ? "endDate" : /discount/i.test(error) ? "discount" : "coupon";
            setError(target as any, { message: error });
            return;
        }

        setEditing(null);
        reset(blank);
        apply(data);
    };

    const startEdit = (coupon: any) => {
        setConfirming("");
        setEditing(coupon);
        reset({
            coupon: coupon.coupon,
            discount: coupon.discount,
            startDate: coupon.startDate,
            endDate: coupon.endDate,
        });
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        setFocus("coupon");
    };

    const cancelEdit = () => {
        setEditing(null);
        reset(blank);
    };

    const remove = async (coupon: any) => {
        setBusy(coupon._id);
        const { data, error } = await adminRequest("delete", "/api/admin/coupon", { id: coupon._id });
        setBusy("");
        setConfirming("");

        if (error) {
            dispatch(showDialog({ header: `Can't delete ${coupon.coupon}`, msgs: [{ msg: error, type: "error" }] }));
            return;
        }

        if (editing?._id === coupon._id) cancelEdit();
        apply(data);
    };

    const describe = (name: string) => (errors[name] ? `coupon-${name}-error` : undefined);

    return (
        <div className="space-y-4">
            <Panel
                title={editing ? `Edit coupon ${editing.coupon}` : "Create a coupon"}
                action={
                    editing && (
                        <button type="button" onClick={cancelEdit} className={`${btn.secondary} h-9`}>
                            Cancel edit
                        </button>
                    )
                }
            >
                <form ref={formRef} onSubmit={handleSubmit(submit)} noValidate className="scroll-mt-20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr_1fr_auto] gap-4 items-start">
                        <div>
                            <label htmlFor="coupon-code" className={label}>
                                Code
                            </label>
                            <input
                                id="coupon-code"
                                {...register("coupon")}
                                placeholder="e.g. SAVE15"
                                maxLength={10}
                                autoComplete="off"
                                spellCheck={false}
                                aria-invalid={errors.coupon ? true : undefined}
                                aria-describedby={describe("coupon") || "coupon-code-hint"}
                                className={`${field} uppercase font-mono`}
                            />
                            {errors.coupon ? (
                                <FieldError id="coupon-coupon-error" error={errors.coupon} />
                            ) : (
                                <p id="coupon-code-hint" className="text-xs text-fg-subtle mt-1">
                                    4–10 letters or numbers. Saved in capitals.
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="coupon-discount" className={label}>
                                Discount (%)
                            </label>
                            <input
                                id="coupon-discount"
                                type="number"
                                inputMode="numeric"
                                min={1}
                                max={99}
                                step={1}
                                {...register("discount")}
                                aria-invalid={errors.discount ? true : undefined}
                                aria-describedby={describe("discount")}
                                className={field}
                            />
                            <FieldError id="coupon-discount-error" error={errors.discount} />
                        </div>

                        <div>
                            <label htmlFor="coupon-start" className={label}>
                                Starts
                            </label>
                            <input
                                id="coupon-start"
                                type="date"
                                {...register("startDate")}
                                aria-invalid={errors.startDate ? true : undefined}
                                aria-describedby={describe("startDate")}
                                className={field}
                            />
                            <FieldError id="coupon-startDate-error" error={errors.startDate} />
                        </div>

                        <div>
                            <label htmlFor="coupon-end" className={label}>
                                Ends
                            </label>
                            <input
                                id="coupon-end"
                                type="date"
                                {...register("endDate")}
                                aria-invalid={errors.endDate ? true : undefined}
                                aria-describedby={describe("endDate")}
                                className={field}
                            />
                            <FieldError id="coupon-endDate-error" error={errors.endDate} />
                        </div>

                        <div className="lg:pt-6">
                            <button type="submit" disabled={isSubmitting} className={`${btn.primary} w-full sm:w-auto`}>
                                {!editing && <PlusIcon className="w-4 h-4" />}
                                {isSubmitting ? "Saving…" : editing ? "Save changes" : "Create coupon"}
                            </button>
                        </div>
                    </div>
                </form>
            </Panel>

            <p className="text-sm text-fg-muted" aria-live="polite">
                {status || `${coupons.length} coupon${coupons.length === 1 ? "" : "s"} · today is ${formatDate(now)} (UTC)`}
            </p>

            <div className={table.wrap}>
                <table className={table.table}>
                    <thead className={table.head}>
                        <tr>
                            <th scope="col" className={table.th}>Code</th>
                            <th scope="col" className={`${table.th} text-right`}>Discount</th>
                            <th scope="col" className={table.th}>Starts</th>
                            <th scope="col" className={table.th}>Ends</th>
                            <th scope="col" className={table.th}>Status</th>
                            <th scope="col" className={`${table.th} text-right`}>
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.length === 0 && (
                            <tr>
                                <td colSpan={6}>
                                    <EmptyState title="No coupons yet">Create the first one with the form above.</EmptyState>
                                </td>
                            </tr>
                        )}

                        {coupons.map((coupon: any) => {
                            const state = couponStatus(coupon, now);
                            const isEditing = editing?._id === coupon._id;

                            return (
                                <tr key={coupon._id} className={`${table.row} ${isEditing ? "bg-warning-soft/40" : ""}`}>
                                    <th scope="row" className={`${table.td} font-mono font-semibold text-fg whitespace-nowrap`}>
                                        {coupon.coupon}
                                    </th>
                                    <td className={`${table.td} text-right tabular-nums`}>{coupon.discount}%</td>
                                    <td className={`${table.td} whitespace-nowrap`}>
                                        <time dateTime={coupon.startDate}>{formatDate(coupon.startDate)}</time>
                                    </td>
                                    <td className={`${table.td} whitespace-nowrap`}>
                                        <time dateTime={coupon.endDate}>{formatDate(coupon.endDate)}</time>
                                    </td>
                                    <td className={table.td}>
                                        <Badge tone={statusTone[state]}>{state}</Badge>
                                    </td>
                                    <td className={`${table.td} text-right whitespace-nowrap`}>
                                        {confirming === coupon._id ? (
                                            <div className="inline-flex items-center gap-1" role="group" aria-label={`Confirm deleting ${coupon.coupon}`}>
                                                <span className="text-xs text-fg-muted mr-1">Delete {coupon.coupon}?</span>
                                                <button
                                                    type="button"
                                                    onClick={() => remove(coupon)}
                                                    disabled={busy === coupon._id}
                                                    className={`${btn.danger} h-9 px-3`}
                                                >
                                                    {busy === coupon._id ? "Deleting…" : "Delete"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirming("")}
                                                    className={`${btn.secondary} h-9 px-3`}
                                                    aria-label="Keep it"
                                                >
                                                    <XMarkIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="inline-flex gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => startEdit(coupon)}
                                                    className={btn.icon}
                                                    aria-label={`Edit ${coupon.coupon}`}
                                                    title="Edit"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirming(coupon._id)}
                                                    className={`${btn.icon} hover:text-danger`}
                                                    aria-label={`Delete ${coupon.coupon}`}
                                                    title="Delete"
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
        </div>
    );
};

export default CouponManager;
