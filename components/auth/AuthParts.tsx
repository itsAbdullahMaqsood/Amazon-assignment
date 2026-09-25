"use client";

import { forwardRef, useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { CheckIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

import { Field } from "@/components/ui/Field";
import { controlClass } from "@/components/ui/Field";
import { cn } from "@/components/ui/cn";
import { passwordRules } from "@/lib/authRules";

export const AuthHeading = ({ title, description }: any) => (
    <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1.5 text-fg-muted">{description}</p>}
    </div>
);

const providers = [
    { id: "google", name: "Google" },
    { id: "github", name: "GitHub" },
];

// Google and GitHub first: one tap for most people.
export const OAuthButtons = ({ callbackUrl = "/" }: any) => (
    <div className="grid grid-cols-2 gap-2">
        {providers.map((provider) => (
            <button
                key={provider.id}
                type="button"
                onClick={() => signIn(provider.id, { callbackUrl })}
                className="flex h-11 items-center justify-center gap-2 rounded-card border border-line-strong bg-surface text-sm font-medium hover:bg-surface-muted cursor-pointer"
            >
                <Image src={`/assets/images/${provider.id}.png`} alt="" width={20} height={20} />
                {provider.name}
            </button>
        ))}
    </div>
);

export const Divider = ({ children }: any) => (
    <div className="my-6 flex items-center gap-3 text-xs text-fg-subtle">
        <span className="h-px flex-1 bg-line" />
        {children}
        <span className="h-px flex-1 bg-line" />
    </div>
);

// A password field with a show/hide toggle, which is why there is no
// "confirm password" box: you can see what you typed.
export const PasswordField = forwardRef<HTMLInputElement, any>(({ label = "Password", error, hint, action, ...rest }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            {action && <div className="absolute right-0 top-0 text-sm">{action}</div>}
            <Field label={label} error={error} hint={hint}>
                {(wiring: any) => (
                    <div className="relative">
                        <input ref={ref} type={visible ? "text" : "password"} className={controlClass(!!error, "pr-11")} {...wiring} {...rest} />
                        <button
                            type="button"
                            onClick={() => setVisible(!visible)}
                            aria-label={visible ? "Hide password" : "Show password"}
                            aria-pressed={visible}
                            className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-control text-fg-muted hover:text-fg cursor-pointer"
                        >
                            {visible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                )}
            </Field>
        </div>
    );
});
PasswordField.displayName = "PasswordField";

// The rules as a checklist that ticks itself while you type.
export const PasswordChecklist = ({ value }: any) => (
    <ul className="mt-2 grid grid-cols-3 gap-2 text-xs" aria-label="Password requirements">
        {passwordRules.map((rule) => {
            const met = rule.test(String(value || ""));

            return (
                <li key={rule.id} className={cn("flex items-center gap-1", met ? "text-success" : "text-fg-subtle")}>
                    <CheckIcon className={cn("h-3.5 w-3.5 shrink-0", !met && "opacity-40")} />
                    {rule.label}
                </li>
            );
        })}
    </ul>
);
