"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import { useAppDispatch } from "@/redux/hooks";
import { showDialog } from "@/redux/slices/DialogSlice";
import useFocusTrap from "@/components/shared/useFocusTrap";
import { allowedNext, shortId } from "@/lib/adminOrders";
import { btn } from "@/components/admin/ui";

// Offers only the moves the API would accept from the current status, and asks
// before cancelling because that one cannot be undone and moves stock.
const StatusControl = ({ order, onUpdated, compact = false }: any) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const selectId = useId();
    const options = allowedNext(order);
    const [choice, setChoice] = useState("");
    const [busy, setBusy] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);

    useFocusTrap(dialogRef, confirming, () => setConfirming(false));

    if (!options.length) {
        return <span className="text-xs text-fg-subtle">Final</span>;
    }

    const send = async (status: string) => {
        setConfirming(false);
        setBusy(true);

        try {
            const res = await fetch(`/api/admin/order/${order._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                dispatch(
                    showDialog({
                        header: "Status not changed",
                        msgs: [{ msg: data.message || "Something went wrong.", type: "error" }],
                    })
                );
                return;
            }

            setChoice("");
            onUpdated?.(data);
            router.refresh();
        } catch {
            dispatch(
                showDialog({
                    header: "Status not changed",
                    msgs: [{ msg: "Could not reach the server. Try again.", type: "error" }],
                })
            );
        } finally {
            setBusy(false);
        }
    };

    const submit = (e: any) => {
        e.preventDefault();

        if (!choice) {
            return;
        }

        if (choice === "Cancelled") {
            setConfirming(true);
            return;
        }

        send(choice);
    };

    return (
        <>
            <form onSubmit={submit} className="flex items-center gap-2">
                <label htmlFor={selectId} className="sr-only">
                    Change status of order {shortId(order._id)}
                </label>
                <select
                    id={selectId}
                    value={choice}
                    onChange={(e) => setChoice(e.target.value)}
                    disabled={busy}
                    className={`h-9 rounded-lg border border-line bg-surface px-2 text-sm outline-none focus:border-accent-ink focus:ring-2 focus:ring-accent-ink/25 ${
                        compact ? "w-36" : "w-44"
                    }`}
                >
                    <option value="">Move to…</option>
                    {options.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
                <button
                    type="submit"
                    disabled={!choice || busy}
                    className={`${btn.secondary} h-9! px-3!`}
                >
                    {busy ? "Saving…" : "Update"}
                </button>
            </form>

            {confirming && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4"
                    onClick={() => setConfirming(false)}
                >
                    <div
                        ref={dialogRef}
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby={`${selectId}-title`}
                        aria-describedby={`${selectId}-desc`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md rounded-xl bg-surface p-6 shadow-xl text-left whitespace-normal"
                    >
                        <div className="flex gap-3">
                            <ExclamationTriangleIcon className="w-6 h-6 shrink-0 text-danger" />
                            <div>
                                <h2 id={`${selectId}-title`} className="font-semibold text-fg">
                                    Cancel order {shortId(order._id)}?
                                </h2>
                                <div id={`${selectId}-desc`} className="text-sm text-fg-muted mt-2 space-y-2">
                                    <p>Cancelling is final: the order&apos;s status cannot change afterwards.</p>
                                    <p>
                                        {order.isPaid
                                            ? "This order was paid, so every item on it goes back into stock."
                                            : "This order was never paid, so no stock was taken and none is restored."}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2 mt-6">
                            <button type="button" onClick={() => setConfirming(false)} className={btn.secondary}>
                                Keep order
                            </button>
                            <button type="button" onClick={() => send("Cancelled")} className={btn.danger}>
                                Cancel order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default StatusControl;
