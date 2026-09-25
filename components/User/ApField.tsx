"use client";

import { useFormContext } from "react-hook-form";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

// Amazon's sign-in form fields: bold 13px label above a short input that turns
// orange on focus and red, with the message beneath it, on an error.
const ApField = ({ name, label, type = "text", autoComplete, hint }: any) => {
    const {
        register,
        formState: { errors },
    } = useFormContext();

    const error: any = errors[name];

    return (
        <div className="mt-3.5">
            <label htmlFor={name} className="block text-[13px] font-bold text-fg mb-0.5">
                {label}
            </label>

            <input
                id={name}
                type={type}
                autoComplete={autoComplete}
                {...register(name)}
                className={`w-full h-[31px] px-[7px] text-[13px] rounded-[3px] border outline-none shadow-[0_1px_0_rgba(255,255,255,.5),0_1px_0_rgba(0,0,0,.07)_inset] ${
                    error
                        ? "border-danger shadow-[0_0_3px_2px_rgba(196,0,0,.15)]"
                        : "border-line-strong focus:border-accent-deep focus:shadow-[0_0_3px_2px_rgba(228,121,17,.5)]"
                }`}
            />

            {error ? (
                <p className="flex items-start gap-1 text-[12px] text-danger mt-1">
                    <ExclamationCircleIcon className="h-4 w-4 shrink-0" />
                    <span>{error.message}</span>
                </p>
            ) : (
                hint && <p className="text-[12px] text-fg mt-1">{hint}</p>
            )}
        </div>
    );
};

export default ApField;
