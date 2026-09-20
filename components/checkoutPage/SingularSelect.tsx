"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";

const SingularSelect = ({ name, placeholder, data, header }: any) => {
    const [focused, setFocused] = useState<boolean>(false);

    const {
        register,
        watch,
        formState: { errors },
    } = useFormContext();

    const { onBlur, ...field } = register(name);
    const error: any = errors[name];
    const moved = focused || Boolean(watch(name));

    return (
        <div className="mb-2">
            <div className="relative">
                <select
                    {...field}
                    onFocus={() => setFocused(true)}
                    onBlur={(e) => {
                        setFocused(false);
                        onBlur(e);
                    }}
                    className={`w-full rounded-xl bg-white outline outline-2 outline-slate-300 focus:outline-4 focus:outline-slate-300 cursor-pointer px-3 ${
                        moved ? "pt-6 pb-2" : "py-4"
                    } ${
                        error ? "text-red-500 outline-red-200 bg-red-50" : ""
                    }`}
                >
                    <option value="">{header || ""}</option>
                    {data?.map((item: any) => (
                        <option key={item.code || item.name} value={item.name}>
                            {item.name}
                        </option>
                    ))}
                </select>

                <span
                    className={`absolute top-4 left-3 text-slate-500 pointer-events-none ${
                        moved ? "move" : ""
                    }`}
                >
                    {placeholder}
                </span>
            </div>

            {error && <span className="text-red-500 text-sm">{error.message}</span>}
        </div>
    );
};

export default SingularSelect;
