"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { refundMethods, returnReasons } from "@/lib/returns";

const ReturnModal = ({ order, line, onClose, onSubmitted }: any) => {
    const [reason, setReason] = useState<string>("");
    const [comments, setComments] = useState<string>("");
    const [refundTo, setRefundTo] = useState<string>(refundMethods[0].value);
    const [error, setError] = useState<string>("");
    const [saving, setSaving] = useState<boolean>(false);

    const item = order.products[line];

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();

        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    const submitHandler = async (e: any) => {
        e.preventDefault();

        if (!reason) {
            setError("Please choose a reason for your return.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const { data } = await axios.post("/api/user/returns", {
                orderId: order._id,
                line,
                reason,
                comments,
                refundTo,
            });

            onSubmitted(data.message);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            setSaving(false);
        }
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 py-10 overflow-y-auto"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Choose a return reason"
                className="w-full max-w-lg bg-white rounded-lg shadow-2xl"
            >
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                    <h2 className="text-lg font-bold">Why are you returning this?</h2>

                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="p-1 rounded hover:bg-slate-100 cursor-pointer"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex gap-3 px-5 py-4 border-b border-slate-200">
                    <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="rounded object-contain w-16 h-16 bg-white shrink-0"
                    />

                    <div className="min-w-0">
                        <p className="text-sm line-clamp-2">{item.name}</p>
                        <p className="text-xs text-slate-600 mt-1">
                            Qty: {item.qty} · ${Number(item.price).toFixed(2)}
                        </p>
                    </div>
                </div>

                <form onSubmit={submitHandler} className="px-5 py-4 space-y-4">
                    <div>
                        <label htmlFor="return-reason" className="block text-sm font-bold mb-1">
                            Reason for return
                        </label>

                        <select
                            id="return-reason"
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                setError("");
                            }}
                            className="w-full border border-slate-400 rounded px-3 py-2 text-sm bg-surface-muted cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-deep"
                        >
                            <option value="">Choose a reason</option>
                            {returnReasons.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="return-comments" className="block text-sm font-bold mb-1">
                            Comments <span className="font-normal text-slate-600">(optional)</span>
                        </label>

                        <textarea
                            id="return-comments"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            rows={3}
                            maxLength={500}
                            placeholder="Tell us more so we can sort it out faster."
                            className="w-full border border-slate-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-deep"
                        />
                    </div>

                    <fieldset>
                        <legend className="text-sm font-bold mb-1">Refund method</legend>

                        <div className="space-y-2">
                            {refundMethods.map((method) => (
                                <label
                                    key={method.value}
                                    className="flex items-start gap-2 text-sm cursor-pointer"
                                >
                                    <input
                                        type="radio"
                                        name="refundTo"
                                        value={method.value}
                                        checked={refundTo === method.value}
                                        onChange={() => setRefundTo(method.value)}
                                        className="mt-1 cursor-pointer"
                                    />
                                    <span>
                                        <span className="font-semibold">{method.value}</span>
                                        <span className="block text-xs text-slate-600">
                                            {method.hint}
                                        </span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    {error && (
                        <p role="alert" className="text-sm text-danger">
                            {error}
                        </p>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-sm text-accent-ink hover:underline cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="button-orange px-6 py-1.5 text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {saving ? "Submitting..." : "Continue"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReturnModal;
