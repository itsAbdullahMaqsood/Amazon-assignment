"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/20/solid";

import Button from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Layout";

// The code is checked by the route, not here: the scheme is the whole card, so
// the browser has no business deciding whether one is genuine.
const RedeemForm = ({ onRedeemed }: any) => {
    const router = useRouter();
    const [code, setCode] = useState("");
    const [done, setDone] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const submit = async (event: any) => {
        event.preventDefault();
        setError("");
        setDone("");
        setBusy(true);

        try {
            const { data } = await axios.post("/api/user/giftcard/redeem", { code });
            setCode("");
            setDone(data.message);
            onRedeemed(data);
            router.refresh();
        } catch (err: any) {
            setError(err.response?.data?.message || "That code couldn't be redeemed.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={submit} noValidate>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <TextField
                    label="Claim code"
                    value={code}
                    onChange={(event: any) => setCode(event.target.value)}
                    placeholder="MRKZ-0025-7975"
                    hint="Spaces, dashes and lower case are all fine."
                    autoComplete="off"
                    spellCheck={false}
                    className="flex-1"
                />
                <Button type="submit" loading={busy} disabled={!code.trim()} className="sm:mb-7">
                    Redeem
                </Button>
            </div>

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
        </form>
    );
};

export default RedeemForm;
