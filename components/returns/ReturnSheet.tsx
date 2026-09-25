"use client";

import { useState } from "react";
import Image from "next/image";
import axios from "axios";

import Sheet from "@/components/ui/Sheet";
import Button from "@/components/ui/Button";
import { RadioCard } from "@/components/ui/Choice";
import { Field, Select, Textarea } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Layout";
import { formatDate, refundMethods, returnReasons } from "@/lib/returns";

// Asks the three things a return needs (which reason, how many, where the
// refund goes) and nothing else. The server checks the window against the
// product's own policy and caps the quantity.
const ReturnSheet = ({ order, line, onClose, onSubmitted }: any) => {
    const [reason, setReason] = useState("");
    const [qty, setQty] = useState(1);
    const [comments, setComments] = useState("");
    const [refundTo, setRefundTo] = useState(refundMethods[0].value);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const open = line !== null && line !== undefined;
    const item = open ? order.lines[line] : null;

    const submit = async () => {
        if (!reason) {
            setError("Choose a reason.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const { data } = await axios.post("/api/user/returns", { orderId: order._id, line, reason, comments, refundTo, qty });
            onSubmitted(data);
        } catch (err: any) {
            setError(err.response?.data?.message || "The return couldn't be requested.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Sheet
            open={open}
            onClose={onClose}
            side="right"
            title="Return an item"
            description={item ? `Return by ${formatDate(item.returns.deadline)} · ${item.returns.windowDays}-day window` : undefined}
            footer={
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button block onClick={submit} loading={saving}>
                        Request return
                    </Button>
                </div>
            }
        >
            {item && (
                <div className="space-y-5">
                    <div className="flex gap-3">
                        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-control bg-surface-muted">
                            {item.image && <Image src={item.image} alt="" fill sizes="64px" className="object-contain p-1" />}
                        </span>
                        <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-sm text-fg-muted">{item.returns.remaining} can be returned</p>
                        </div>
                    </div>

                    <Field label="Why are you returning it?">
                        {(wiring: any) => (
                            <Select value={reason} onChange={(e: any) => setReason(e.target.value)} invalid={!!error && !reason} {...wiring}>
                                <option value="">Choose a reason</option>
                                {returnReasons.map((entry) => (
                                    <option key={entry} value={entry}>
                                        {entry}
                                    </option>
                                ))}
                            </Select>
                        )}
                    </Field>

                    {item.returns.remaining > 1 && (
                        <Field label="How many?">
                            {(wiring: any) => (
                                <Select value={qty} onChange={(e: any) => setQty(Number(e.target.value))} {...wiring}>
                                    {Array.from({ length: item.returns.remaining }, (_, i) => i + 1).map((n) => (
                                        <option key={n} value={n}>
                                            {n}
                                        </option>
                                    ))}
                                </Select>
                            )}
                        </Field>
                    )}

                    <fieldset>
                        <legend className="mb-1.5 text-sm font-medium">Refund to</legend>
                        <div className="space-y-2">
                            {refundMethods.map((method) => (
                                <RadioCard
                                    key={method.value}
                                    name="refund"
                                    checked={refundTo === method.value}
                                    onChange={() => setRefundTo(method.value)}
                                    label={method.value}
                                    description={method.hint}
                                />
                            ))}
                        </div>
                    </fieldset>

                    <Field label="Anything we should know?" optional>
                        {(wiring: any) => (
                            <Textarea value={comments} maxLength={500} onChange={(e: any) => setComments(e.target.value)} {...wiring} />
                        )}
                    </Field>

                    {error && <Notice tone="danger">{error}</Notice>}
                </div>
            )}
        </Sheet>
    );
};

export default ReturnSheet;
