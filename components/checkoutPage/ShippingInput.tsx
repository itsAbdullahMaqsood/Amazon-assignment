"use client";

import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

const ShippingInput = ({ name, placeholder }: any) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [focused, setFocused] = useState<boolean>(false);

    const {
        register,
        watch,
        formState: { errors },
    } = useFormContext();

    const { ref, onBlur, ...field } = register(name);
    const error: any = errors[name];
    // Derived, not mirrored: the label sits up when the field has focus or a value.
    const moved = focused || Boolean(watch(name));

    return (
        <div className="mb-2">
            <div className="relative">
                <input
                    {...field}
                    ref={(element) => {
                        ref(element);
                        inputRef.current = element;
                    }}
                    onFocus={() => setFocused(true)}
                    onBlur={(e) => {
                        setFocused(false);
                        onBlur(e);
                    }}
                    className={`w-full rounded-xl py-4 px-3 outline outline-2 outline-slate-300 focus:outline-4 focus:outline-slate-300 ${
                        error ? "text-red-500 outline-red-200 bg-red-50" : ""
                    }`}
                />

                <span
                    onClick={() => inputRef.current?.focus()}
                    className={`absolute top-4 left-3 text-slate-500 cursor-text ${moved ? "move" : ""}`}
                >
                    {placeholder}
                </span>
            </div>

            {error && <span className="text-red-500 text-sm">{error.message}</span>}
        </div>
    );
};

export default ShippingInput;
