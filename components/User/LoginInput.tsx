"use client";

import { useFormContext } from "react-hook-form";
import { LockClosedIcon, PaperAirplaneIcon, UserIcon } from "@heroicons/react/24/outline";

const passwordCaption = (name: string) => {
    if (name === "conf_password") return "Confirm Password";
    if (name === "current_password") return "Current Password";
    if (name === "new_password") return "New Password";
    return "Password";
};

const LoginInput = ({ name, type, icon, placeholder }: any) => {
    const {
        register,
        formState: { errors },
    } = useFormContext();

    const error: any = errors[name];

    return (
        <div className={`my-3 ${error ? "error-input" : ""}`}>
            <label htmlFor={name} className="flex items-center gap-1 text-sm font-semibold mb-1">
                {icon === "email" && <PaperAirplaneIcon className="h-4 -rotate-45" />}
                {icon === "password" && <LockClosedIcon className="h-4" />}
                {icon === "user" && <UserIcon className="h-4" />}

                {icon === "email" && "Email"}
                {icon === "password" && passwordCaption(name)}
                {icon === "user" && "Full Name"}
            </label>

            <input
                id={name}
                type={type}
                placeholder={placeholder}
                {...register(name)}
                className="text-sm w-full placeholder:font-normal p-2 outline-none rounded border border-slate-300"
            />

            {error && <span className="text-sm text-red-500">{error.message}</span>}
        </div>
    );
};

export default LoginInput;
