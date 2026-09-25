"use client";

import { useState } from "react";
import axios from "axios";

import Button from "@/components/ui/Button";
import Sheet from "@/components/ui/Sheet";
import { TextField } from "@/components/ui/Field";
import { RadioCard } from "@/components/ui/Choice";
import { Notice } from "@/components/ui/Layout";
import { MAX_NAME, privacyOptions } from "@/lib/lists";

// Creating a list, and editing the two things a list has: its name and who can
// see it. The privacy options say what they mean in a sentence, because
// "Shared" and "Public" are not self-evident.
const ListFormSheet = ({ open, onClose, list, onSaved }: any) => {
    const editing = Boolean(list?._id);
    const [name, setName] = useState(list?.name || "");
    const [privacy, setPrivacy] = useState(list?.privacy || "private");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const submit = async (event: any) => {
        event.preventDefault();
        setError("");
        setBusy(true);

        try {
            const { data } = editing
                ? await axios.patch("/api/user/lists", { list_id: list._id, name, privacy })
                : await axios.post("/api/user/lists", { name, privacy });

            onSaved(data);
        } catch (err: any) {
            setError(err.response?.data?.message || "That couldn't be saved.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Sheet
            open={open}
            onClose={onClose}
            side="right"
            title={editing ? "Edit list" : "Create a list"}
            description={editing ? undefined : "A list is a named set of products you can keep private or share."}
        >
            <form onSubmit={submit} noValidate>
                <TextField
                    label="List name"
                    value={name}
                    maxLength={MAX_NAME}
                    onChange={(event: any) => setName(event.target.value)}
                    hint={`Up to ${MAX_NAME} characters, e.g. “Kitchen for the new flat”.`}
                    autoFocus
                />

                <fieldset className="mt-5">
                    <legend className="text-sm font-medium text-fg">Who can see it</legend>
                    <div className="mt-2 grid gap-2">
                        {privacyOptions.map((option) => (
                            <RadioCard
                                key={option.value}
                                name="privacy"
                                value={option.value}
                                checked={privacy === option.value}
                                onChange={() => setPrivacy(option.value)}
                                label={option.label}
                                description={option.hint}
                            />
                        ))}
                    </div>
                </fieldset>

                {error && (
                    <Notice tone="danger" className="mt-4">
                        {error}
                    </Notice>
                )}

                <div className="mt-6 flex gap-2">
                    <Button type="submit" loading={busy} disabled={!name.trim()}>
                        {editing ? "Save changes" : "Create list"}
                    </Button>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Sheet>
    );
};

export default ListFormSheet;
