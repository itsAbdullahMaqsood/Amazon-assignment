"use client";

import { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { CheckCircleIcon } from "@heroicons/react/20/solid";

import Button from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Layout";

// The name is only ever shown back to the customer (the greeting, order
// emails), so it is edited in place rather than behind a dialog.
const NameForm = ({ name: initial }: any) => {
    const { update } = useSession();
    const [name, setName] = useState(initial || "");
    const [savedName, setSavedName] = useState(initial || "");
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const submit = async (event: any) => {
        event.preventDefault();
        setError("");
        setSaved(false);
        setBusy(true);

        try {
            const { data } = await axios.put("/api/user/account", { name });
            setName(data.name);
            setSavedName(data.name);
            // Keeps the header greeting in step without a fresh sign-in.
            await update({ name: data.name });
            setSaved(true);
        } catch (err: any) {
            setError(err.response?.data?.message || "That couldn't be saved.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={submit} noValidate>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <TextField
                    label="Your name"
                    value={name}
                    onChange={(event: any) => {
                        setName(event.target.value);
                        setSaved(false);
                    }}
                    autoComplete="name"
                    className="flex-1"
                />
                <Button type="submit" variant="outline" loading={busy} disabled={!name.trim() || name === savedName}>
                    Save
                </Button>
            </div>

            <div aria-live="polite" className="mt-2 empty:mt-0">
                {error ? (
                    <Notice tone="danger">{error}</Notice>
                ) : saved ? (
                    <p className="flex items-center gap-1.5 text-sm text-success">
                        <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
                        Saved.
                    </p>
                ) : null}
            </div>
        </form>
    );
};

export default NameForm;
