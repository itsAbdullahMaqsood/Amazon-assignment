"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Sheet from "@/components/ui/Sheet";
import { RadioCard } from "@/components/ui/Choice";
import { Notice } from "@/components/ui/Layout";
import { money } from "@/components/ui/Price";
import { plans } from "@/lib/membership";

const dateOf = (value: any) =>
    value ? new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "";

// Joining, changing plan and cancelling. Every date comes back from the server,
// because the membership is what decides whether checkout waives delivery.
const MembershipPanel = ({ membership: initial, compact = false }: any) => {
    const router = useRouter();
    const [membership, setMembership] = useState<any>(initial);
    const [plan, setPlan] = useState(initial?.plan?.id || "annual");
    const [cancelling, setCancelling] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [note, setNote] = useState("");

    const send = async (request: () => Promise<any>) => {
        setError("");
        setBusy(true);

        try {
            const { data } = await request();
            setMembership(data.membership);
            setNote(data.message);
            setCancelling(false);
            // Delivery charges change with it, so anything already rendered
            // (the cart summary, the header) is re-fetched.
            router.refresh();
        } catch (err: any) {
            setError(err.response?.data?.message || "That didn't work.");
        } finally {
            setBusy(false);
        }
    };

    const join = () => send(() => axios.post("/api/user/membership", { plan }));
    const cancel = () => send(() => axios.delete("/api/user/membership"));

    if (membership?.active) {
        return (
            <div className="rounded-panel border border-line bg-surface p-5 md:p-6">
                <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-display text-xl font-semibold text-fg">Markaz Plus</h2>
                    <Badge tone={membership.inTrial ? "accent" : "success"}>{membership.inTrial ? "Free trial" : "Member"}</Badge>
                </div>

                <p className="mt-2 text-sm text-fg-muted">
                    {membership.inTrial ? (
                        <>
                            Your free trial runs until {dateOf(membership.trialEndsAt)}. After that the{" "}
                            {membership.plan.name.toLowerCase()} plan is {money(membership.plan.price)} {membership.plan.cadence}.
                        </>
                    ) : (
                        <>
                            On the {membership.plan.name.toLowerCase()} plan, {money(membership.plan.price)} {membership.plan.cadence},
                            next due {dateOf(membership.renewsAt)}.
                        </>
                    )}{" "}
                    Nothing is ever charged in this build.
                </p>

                <p className="mt-3 text-sm text-fg">Delivery charges are waived on every order while this is active.</p>

                {!compact && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {plans
                            .filter((entry) => entry.id !== membership.plan.id)
                            .map((entry) => (
                                <Button
                                    key={entry.id}
                                    variant="outline"
                                    size="sm"
                                    loading={busy}
                                    onClick={() => send(() => axios.post("/api/user/membership", { plan: entry.id }))}
                                >
                                    Switch to {entry.name.toLowerCase()}
                                </Button>
                            ))}
                    </div>
                )}

                <div className="mt-4 border-t border-line pt-4">
                    <button type="button" onClick={() => setCancelling(true)} className="text-sm text-link">
                        Cancel membership
                    </button>
                </div>

                <div aria-live="polite" className="mt-3 empty:mt-0">
                    {error ? <Notice tone="danger">{error}</Notice> : note ? <p className="text-sm text-success">{note}</p> : null}
                </div>

                <Sheet
                    open={cancelling}
                    onClose={() => setCancelling(false)}
                    side="center"
                    title="Cancel Markaz Plus?"
                    footer={
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setCancelling(false)}>
                                Keep it
                            </Button>
                            <Button variant="danger" loading={busy} onClick={cancel}>
                                Cancel membership
                            </Button>
                        </div>
                    }
                >
                    <p className="text-sm text-fg-muted">
                        It ends straight away, and delivery is charged per item again from your next order. You can
                        rejoin whenever you like — the free trial is only offered once.
                    </p>
                </Sheet>
            </div>
        );
    }

    return (
        <div className="rounded-panel border border-line bg-surface p-5 md:p-6">
            <h2 className="font-display text-xl font-semibold text-fg">Start with 30 days free</h2>
            <p className="mt-1 text-sm text-fg-muted">
                Delivery charges are waived from your first order. Nothing is charged in this build, during the trial
                or after it.
            </p>

            <div className="mt-4 grid gap-2">
                {plans.map((entry) => (
                    <RadioCard
                        key={entry.id}
                        name="plan"
                        value={entry.id}
                        checked={plan === entry.id}
                        onChange={() => setPlan(entry.id)}
                        label={`${entry.name} · ${money(entry.price)} ${entry.cadence}`}
                        description={entry.summary}
                    />
                ))}
            </div>

            <Button className="mt-4" loading={busy} onClick={join}>
                Start the free trial
            </Button>

            <div aria-live="polite" className="mt-3 empty:mt-0">
                {error ? <Notice tone="danger">{error}</Notice> : note ? <p className="text-sm text-success">{note}</p> : null}
            </div>
        </div>
    );
};

export default MembershipPanel;
