import { forwardRef, useId } from "react";

import { cn } from "./cn";

export const controlClass = (invalid?: boolean, className = "") =>
    cn(
        "w-full h-11 px-3 rounded-control border bg-surface text-fg text-base md:text-sm placeholder:text-fg-subtle",
        "transition-colors outline-none focus:border-accent-ink focus:ring-2 focus:ring-accent/60",
        "disabled:bg-surface-muted disabled:text-fg-subtle",
        invalid ? "border-danger" : "border-line-strong hover:border-fg-subtle",
        className
    );

// Label, control, then either the error or the hint underneath. The control is
// passed the id and the describedby wiring through a render function so any
// input-like element can sit inside.
export const Field = ({ label, hint, error, optional, className = "", children, id: givenId }: any) => {
    const autoId = useId();
    const id = givenId || autoId;
    const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-fg">
                    {label}
                    {optional && <span className="ml-1 font-normal text-fg-subtle">(optional)</span>}
                </label>
            )}

            {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}

            {error ? (
                <p id={`${id}-error`} className="text-sm text-danger">
                    {error}
                </p>
            ) : hint ? (
                <p id={`${id}-hint`} className="text-sm text-fg-muted">
                    {hint}
                </p>
            ) : null}
        </div>
    );
};

export const Input = forwardRef<HTMLInputElement, any>(({ invalid, className = "", ...rest }, ref) => (
    <input ref={ref} className={controlClass(invalid, className)} {...rest} />
));
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, any>(({ invalid, className = "", ...rest }, ref) => (
    <textarea ref={ref} className={controlClass(invalid, cn("h-auto min-h-24 py-2.5", className))} {...rest} />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, any>(({ invalid, className = "", children, ...rest }, ref) => (
    <select ref={ref} className={controlClass(invalid, cn("pr-8 cursor-pointer", className))} {...rest}>
        {children}
    </select>
));
Select.displayName = "Select";

// Text input wired into a Field in one go, for the common case.
export const TextField = forwardRef<HTMLInputElement, any>(
    ({ label, hint, error, optional, className, ...rest }, ref) => (
        <Field label={label} hint={hint} error={error} optional={optional} className={className} id={rest.id}>
            {(wiring: any) => <Input ref={ref} invalid={!!error} {...wiring} {...rest} />}
        </Field>
    )
);
TextField.displayName = "TextField";
