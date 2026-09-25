"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { UsersIcon } from "@heroicons/react/24/outline";

import Button from "@/components/ui/Button";
import Sheet from "@/components/ui/Sheet";
import { Switch } from "@/components/ui/Choice";
import { TextField } from "@/components/ui/Field";
import { EmptyState, Notice } from "@/components/ui/Layout";
import { MAX_MEMBERS, householdDate } from "@/lib/household";

// A household is the people you share Plus delivery with. One benefit, because
// one is what this store has, and the page says what happens to someone who is
// not a Markaz customer yet.
const HouseholdView = ({ household: initial, member }: any) => {
    const [household, setHousehold] = useState<any>(initial);
    const [adding, setAdding] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [busy, setBusy] = useState("");
    const [error, setError] = useState("");

    const send = async (key: string, request: () => Promise<any>) => {
        setError("");
        setBusy(key);

        try {
            const { data } = await request();
            setHousehold(data.household);
            setAdding(false);
            setName("");
            setEmail("");
        } catch (err: any) {
            setError(err.response?.data?.message || "That didn't work.");
        } finally {
            setBusy("");
        }
    };

    const members = household.members || [];

    return (
        <>
            {!member && (
                <Notice tone="warning" title="You are not a Markaz Plus member" className="mb-4">
                    A household shares your membership&apos;s free delivery. Without one there is nothing to share yet —{" "}
                    <Link href="/plus" className="text-link">
                        have a look at Plus
                    </Link>
                    .
                </Notice>
            )}

            {error && <Notice tone="danger" className="mb-4">{error}</Notice>}

            {members.length === 0 ? (
                <EmptyState
                    icon={UsersIcon}
                    title="Nobody in your household yet"
                    description={`Add up to ${MAX_MEMBERS} people by email. If they have a Markaz account, their delivery charges are waived too, for as long as your membership runs.`}
                    action={<Button onClick={() => setAdding(true)}>Add someone</Button>}
                />
            ) : (
                <>
                    <ul className="divide-y divide-line rounded-card border border-line bg-surface">
                        {members.map((entry: any) => (
                            <li key={entry._id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                                <span className="min-w-0">
                                    <span className="block text-sm font-medium text-fg">{entry.name}</span>
                                    <span className="block text-sm text-fg-muted">{entry.email}</span>
                                    <span className="block text-xs text-fg-subtle">Added {householdDate(entry.addedAt)}</span>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => send(entry._id, () => axios.delete("/api/user/household", { data: { id: entry._id } }))}
                                    disabled={busy === entry._id}
                                    className="text-sm text-link disabled:opacity-50"
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>

                    {members.length < MAX_MEMBERS && (
                        <Button variant="outline" className="mt-4" onClick={() => setAdding(true)}>
                            Add someone
                        </Button>
                    )}
                </>
            )}

            <div className="mt-8 rounded-card border border-line bg-surface p-4">
                <Switch
                    checked={household.sharing?.delivery !== false}
                    onChange={(value: boolean) => send("sharing", () => axios.patch("/api/user/household", { delivery: value }))}
                    label="Share free delivery"
                    description="While this is on, everyone above pays no delivery charge at checkout, the same as you. Turning it off keeps the household but stops the benefit."
                />
            </div>

            <p className="mt-4 max-w-prose text-sm text-fg-muted">
                That is the whole of it. Markaz does not share payment methods, order history, lists or addresses
                between household accounts, and adding someone does not tell you whether they have an account — it
                only means the benefit reaches them if they do.
            </p>

            <Sheet
                open={adding}
                onClose={() => setAdding(false)}
                side="right"
                title="Add someone to your household"
                description="Use the email address their Markaz account uses."
            >
                <form
                    onSubmit={(event: any) => {
                        event.preventDefault();
                        send("add", () => axios.post("/api/user/household", { name, email }));
                    }}
                    noValidate
                >
                    <TextField label="Their name" value={name} onChange={(e: any) => setName(e.target.value)} autoFocus />
                    <TextField
                        label="Their email"
                        type="email"
                        value={email}
                        onChange={(e: any) => setEmail(e.target.value)}
                        className="mt-4"
                        hint="Only used to match a Markaz account. No invitation is emailed — this build sends no mail of its own."
                    />

                    <Button type="submit" className="mt-5" loading={busy === "add"} disabled={!name.trim() || !email.trim()}>
                        Add to household
                    </Button>
                </form>
            </Sheet>
        </>
    );
};

export default HouseholdView;
