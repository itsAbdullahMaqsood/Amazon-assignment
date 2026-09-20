"use client";

import { useState } from "react";
import axios from "axios";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import LoginInput from "@/components/User/LoginInput";
import ButtonInput from "@/components/User/ButtonInput";

const password = (label: string) =>
    z
        .string()
        .min(1, `${label} is required.`)
        .min(6, `${label} must be between 6 and 36 characters.`)
        .max(36, `${label} must be between 6 and 36 characters.`);

const schema = z
    .object({
        current_password: password("Current password"),
        new_password: password("New password"),
        conf_password: z.string().min(1, "Please confirm your new password."),
    })
    .refine((values) => values.new_password === values.conf_password, {
        message: "Passwords must match.",
        path: ["conf_password"],
    });

const empty = { current_password: "", new_password: "", conf_password: "" };

const SecurityClient = () => {
    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<string>("");

    const methods = useForm({ resolver: zodResolver(schema), defaultValues: empty });

    const submitHandler = async (values: any) => {
        try {
            setError("");

            const { data } = await axios.put("/api/user/changepassword", {
                current_password: values.current_password,
                new_password: values.new_password,
            });

            setMessage(data.message);
            methods.reset(empty);
        } catch (err: any) {
            setMessage("");
            setError(err.response?.data?.message || err.message);
        }
    };

    return (
        <div className="bg-white border border-slate-300 rounded-lg p-5 max-w-lg">
            <h2 className="text-lg font-bold mb-3">Change password</h2>

            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(submitHandler)}>
                    <LoginInput
                        name="current_password"
                        type="password"
                        icon="password"
                        placeholder="Current password"
                    />
                    <LoginInput
                        name="new_password"
                        type="password"
                        icon="password"
                        placeholder="New password"
                    />
                    <LoginInput
                        name="conf_password"
                        type="password"
                        icon="password"
                        placeholder="Re-type new password"
                    />
                    <ButtonInput text="Change password" />
                </form>
            </FormProvider>

            {message && <p className="text-green-600 text-sm mt-3">{message}</p>}
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>
    );
};

export default SecurityClient;
