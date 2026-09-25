"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { CheckCircleIcon } from "@heroicons/react/20/solid";

import Card from "@/components/ui/Card";
import { Switch } from "@/components/ui/Choice";
import { Notice } from "@/components/ui/Layout";
import { preferenceSwitches } from "@/lib/preferences";

// Three switches, all of which do something. Each saves as you flip it and
// takes effect on the next page, because two of them are applied by the server
// on the first paint.
const PreferencesView = ({ preferences: initial, signedIn }: any) => {
    const [values, setValues] = useState<any>(initial);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    const set = async (id: string, on: boolean) => {
        const previous = values;
        const next = { ...values, [id]: on };

        setValues(next);
        setSaved(false);
        setError("");

        try {
            await axios.put("/api/user/preferences", next);
            setSaved(true);
        } catch (err: any) {
            setValues(previous);
            setError(err.response?.data?.message || "That couldn't be saved.");
        }
    };

    return (
        <>
            <Card>
                <ul className="divide-y divide-line">
                    {preferenceSwitches.map((entry) => (
                        <li key={entry.id}>
                            <Switch
                                checked={Boolean(values[entry.id])}
                                onChange={(on: boolean) => set(entry.id, on)}
                                label={entry.label}
                                description={
                                    <>
                                        {entry.hint}
                                        {entry.href && (
                                            <>
                                                {" "}
                                                <Link href={entry.href} className="text-link">
                                                    {entry.hrefLabel}
                                                </Link>
                                                .
                                            </>
                                        )}
                                    </>
                                }
                            />
                        </li>
                    ))}
                </ul>

                <div aria-live="polite" className="mt-3 empty:mt-0">
                    {error ? (
                        <Notice tone="danger">{error}</Notice>
                    ) : saved ? (
                        <p className="flex items-center gap-1.5 text-sm text-success">
                            <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
                            Saved. Motion and text size apply as you move around the store.
                        </p>
                    ) : null}
                </div>
            </Card>

            {!signedIn && (
                <Notice tone="neutral" className="mt-4">
                    You are not signed in, so these are kept in this browser only. Sign in and they follow the account.
                </Notice>
            )}
        </>
    );
};

export default PreferencesView;
