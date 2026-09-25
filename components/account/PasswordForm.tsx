"use client";

import { useState } from "react";
import axios from "axios";
import { useForm, useWatch } from "react-hook-form";
import { CheckCircleIcon } from "@heroicons/react/20/solid";

import Button from "@/components/ui/Button";
import { Notice } from "@/components/ui/Layout";
import { PasswordChecklist, PasswordField } from "@/components/auth/AuthParts";
import { passwordIssue } from "@/lib/authRules";

const empty = { current_password: "", new_password: "" };

// Two boxes, not three: the show/hide toggle does the job the old "re-type your
// new password" field was there for, and the rules tick themselves off.
const PasswordForm = () => {
    const [done, setDone] = useState("");
    const [error, setError] = useState("");
    const { register, handleSubmit, control, reset, formState } = useForm({ defaultValues: empty });
    const next = useWatch({ control, name: "new_password" });

    const submit = async (values: any) => {
        setError("");
        setDone("");

        try {
            const { data } = await axios.put("/api/user/changepassword", values);
            reset(empty);
            setDone(data.message);
        } catch (err: any) {
            setError(err.response?.data?.message || "That couldn't be changed.");
        }
    };

    return (
        <form onSubmit={handleSubmit(submit)} noValidate className="max-w-sm">
            <PasswordField
                label="Current password"
                autoComplete="current-password"
                error={(formState.errors as any).current_password?.message}
                {...register("current_password", { required: "Enter your current password." })}
            />

            <div className="mt-4">
                <PasswordField
                    label="New password"
                    autoComplete="new-password"
                    error={(formState.errors as any).new_password?.message}
                    {...register("new_password", {
                        required: "Choose a new password.",
                        validate: (value: string) => passwordIssue(value) || true,
                    })}
                />
                <PasswordChecklist value={next} />
            </div>

            <Button type="submit" className="mt-5" loading={formState.isSubmitting}>
                Change password
            </Button>

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

export default PasswordForm;
