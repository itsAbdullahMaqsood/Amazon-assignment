"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { signOut } from "next-auth/react";
import { CheckCircleIcon } from "@heroicons/react/20/solid";

import Button from "@/components/ui/Button";
import Card, { CardHeader } from "@/components/ui/Card";
import Sheet from "@/components/ui/Sheet";
import { Checkbox } from "@/components/ui/Choice";
import { Select, TextField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Layout";

const categories = [
    { value: "orders", label: "Your orders", hint: "Items, totals, addresses, payment method and returns." },
    { value: "history", label: "Browsing history", hint: "The products you have opened, newest first." },
    { value: "account", label: "Account information", hint: "Name, email, saved addresses and default payment method." },
    { value: "all", label: "Everything above", hint: "Adds your cart and your saved lists to the same file." },
];

// The export is built and downloaded in the same request — there is no queue to
// wait in, so the page does not pretend to have one.
const DataView = ({ email, holdings }: any) => {
    const [category, setCategory] = useState("orders");
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState("");
    const [error, setError] = useState("");

    const [closing, setClosing] = useState(false);
    const [understood, setUnderstood] = useState(false);
    const [typed, setTyped] = useState("");
    const [closeBusy, setCloseBusy] = useState(false);
    const [closeError, setCloseError] = useState("");

    const download = async () => {
        setBusy(true);
        setDone("");
        setError("");

        try {
            const response = await axios.get(`/api/user/data?category=${category}`, { responseType: "blob" });
            const disposition = String(response.headers["content-disposition"] || "");
            const filename = disposition.match(/filename="?([^"]+)"?/)?.[1] || `markaz-${category}.json`;
            const url = URL.createObjectURL(response.data);
            const anchor = document.createElement("a");

            anchor.href = url;
            anchor.download = filename;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);

            setDone(`Downloaded as ${filename}.`);
        } catch (err: any) {
            let message = "That export couldn't be built.";

            try {
                // With responseType blob the error body arrives as a blob too.
                message = JSON.parse((await err.response?.data?.text?.()) || "{}").message || message;
            } catch {
                // Keep the default.
            }

            setError(message);
        } finally {
            setBusy(false);
        }
    };

    const closeAccount = async () => {
        setCloseBusy(true);
        setCloseError("");

        try {
            await axios.delete("/api/user/account", { data: { confirm: true, email: typed } });
            await signOut({ callbackUrl: "/" });
        } catch (err: any) {
            setCloseError(err.response?.data?.message || "The account couldn't be closed.");
            setCloseBusy(false);
        }
    };

    return (
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
            <Card>
                <CardHeader title="Take a copy" description="A JSON file, built and downloaded straight away." />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <label className="flex-1">
                        <span className="text-sm font-medium text-fg">What to include</span>
                        <Select value={category} onChange={(event: any) => setCategory(event.target.value)} className="mt-1.5">
                            {categories.map((entry) => (
                                <option key={entry.value} value={entry.value}>
                                    {entry.label}
                                </option>
                            ))}
                        </Select>
                    </label>
                    <Button onClick={download} loading={busy}>
                        Download
                    </Button>
                </div>

                <p className="mt-2 text-sm text-fg-muted">{categories.find((entry) => entry.value === category)?.hint}</p>

                <div aria-live="polite" className="mt-3 empty:mt-0">
                    {error ? (
                        <Notice tone="danger">{error}</Notice>
                    ) : done ? (
                        <p className="flex items-center gap-1.5 text-sm text-success">
                            <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
                            {done}
                        </p>
                    ) : null}
                </div>

                <p className="mt-4 border-t border-line pt-4 text-sm text-fg-muted">
                    Your password is never in an export. It is stored only as a bcrypt hash, and the export query
                    does not select the field at all.
                </p>
            </Card>

            <div className="grid gap-4">
                <Card>
                    <CardHeader title="What Markaz holds" description="Everything on your account, in plain words." />

                    <dl className="divide-y divide-line border-t border-line text-sm">
                        {holdings.map((entry: any) => (
                            <div key={entry.title} className="py-3">
                                <dt className="font-medium text-fg">{entry.title}</dt>
                                <dd className="mt-0.5 text-fg-muted">{entry.body}</dd>
                            </div>
                        ))}
                    </dl>

                    <p className="mt-4 text-sm text-fg-muted">
                        To stop new browsing history being recorded, use{" "}
                        <Link href="/profile/preferences" className="text-link">
                            shopping preferences
                        </Link>
                        ; to empty what is already there,{" "}
                        <Link href="/profile/recent" className="text-link">
                            clear your history
                        </Link>
                        .
                    </p>
                </Card>

                <Card>
                    <CardHeader title="Close your account" description="Irreversible, and it happens immediately." />

                    <p className="text-sm text-fg-muted">
                        Your account, addresses, lists, saved items and cart are deleted. Orders are kept: they are
                        financial records, and their customer reference is required, so they are left as they are
                        rather than anonymised.
                    </p>

                    <Button variant="danger-outline" className="mt-4" onClick={() => setClosing(true)}>
                        Close this account
                    </Button>
                </Card>
            </div>

            <Sheet
                open={closing}
                onClose={() => setClosing(false)}
                side="center"
                title="Close your Markaz account?"
                footer={
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setClosing(false)}>
                            Keep my account
                        </Button>
                        <Button
                            variant="danger"
                            loading={closeBusy}
                            disabled={!understood || typed.trim().toLowerCase() !== String(email).toLowerCase()}
                            onClick={closeAccount}
                        >
                            Close it for good
                        </Button>
                    </div>
                }
            >
                <p className="text-sm text-fg-muted">
                    This cannot be undone. Everything except your orders is deleted, and you are signed out.
                </p>

                <Checkbox
                    className="mt-4"
                    checked={understood}
                    onChange={(event: any) => setUnderstood(event.target.checked)}
                    label="I understand this cannot be undone."
                />

                <TextField
                    label="Type your email address to confirm"
                    value={typed}
                    onChange={(event: any) => setTyped(event.target.value)}
                    placeholder={email}
                    autoComplete="off"
                    className="mt-4"
                />

                {closeError && (
                    <Notice tone="danger" className="mt-4">
                        {closeError}
                    </Notice>
                )}
            </Sheet>
        </div>
    );
};

export default DataView;
