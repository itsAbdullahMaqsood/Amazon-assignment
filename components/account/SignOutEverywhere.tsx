"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import axios from "axios";

import Button from "@/components/ui/Button";
import Sheet from "@/components/ui/Sheet";
import { Notice } from "@/components/ui/Layout";

// Raising the account's session version is what actually ends the other
// sessions; signing this browser out afterwards is only tidiness, since its
// token is dead too.
const SignOutEverywhere = () => {
    const [confirming, setConfirming] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const run = async () => {
        setError("");
        setBusy(true);

        try {
            await axios.delete("/api/user/sessions");
            await signOut({ callbackUrl: "/auth/signin" });
        } catch (err: any) {
            setError(err.response?.data?.message || "That didn't work.");
            setBusy(false);
        }
    };

    return (
        <>
            {error && <Notice tone="danger" className="mb-4">{error}</Notice>}

            <Button variant="outline" onClick={() => setConfirming(true)}>
                Sign out everywhere
            </Button>

            <Sheet
                open={confirming}
                onClose={() => setConfirming(false)}
                side="center"
                title="Sign out of every browser?"
                footer={
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setConfirming(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" loading={busy} onClick={run}>
                            Sign out everywhere
                        </Button>
                    </div>
                }
            >
                <p className="text-sm text-fg-muted">
                    Every browser signed in to this account is signed out, including this one, and you will need to
                    sign in again. Your cart, orders and lists are untouched.
                </p>
            </Sheet>
        </>
    );
};

export default SignOutEverywhere;
