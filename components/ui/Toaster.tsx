"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircleIcon, ExclamationCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { dismissToast, selectToasts } from "@/redux/slices/ToastSlice";
import { buttonClass } from "./Button";

const LIFETIME = 5000;

const ToastItem = ({ toast }: any) => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const timer = setTimeout(() => dispatch(dismissToast(toast.id)), LIFETIME);
        return () => clearTimeout(timer);
    }, [dispatch, toast.id]);

    const Icon = toast.tone === "danger" ? ExclamationCircleIcon : CheckCircleIcon;

    return (
        <div className="pointer-events-auto w-full sm:w-96 rounded-panel bg-ink-900 text-fg-inverse shadow-pop p-4 animate-toast-in">
            <div className="flex items-start gap-3">
                {toast.image ? (
                    <Image src={toast.image} alt="" width={48} height={48} className="h-12 w-12 rounded-control object-cover bg-surface shrink-0" />
                ) : (
                    <Icon className={toast.tone === "danger" ? "h-6 w-6 text-danger-soft shrink-0" : "h-6 w-6 text-accent shrink-0"} />
                )}

                <div className="flex-1 min-w-0">
                    <p className="font-medium">{toast.title}</p>
                    {toast.body && <p className="text-sm text-fg-inverse-muted mt-0.5 line-clamp-2">{toast.body}</p>}
                </div>

                <button
                    type="button"
                    onClick={() => dispatch(dismissToast(toast.id))}
                    aria-label="Dismiss"
                    className="-m-1 p-1 rounded-control text-fg-inverse-muted hover:text-fg-inverse cursor-pointer"
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>

            {(toast.action || toast.secondary) && (
                <div className="flex gap-2 mt-3">
                    {toast.secondary && (
                        <Link
                            href={toast.secondary.href}
                            onClick={() => dispatch(dismissToast(toast.id))}
                            className={buttonClass({ variant: "inverse", size: "sm", className: "flex-1" })}
                        >
                            {toast.secondary.label}
                        </Link>
                    )}
                    {toast.action && (
                        <Link
                            href={toast.action.href}
                            onClick={() => dispatch(dismissToast(toast.id))}
                            className={buttonClass({ variant: "primary", size: "sm", className: "flex-1" })}
                        >
                            {toast.action.label}
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};

// Bottom-centre on phones (above any sticky action bar), bottom-right on desktop.
const Toaster = () => {
    const toasts = useAppSelector(selectToasts);

    return (
        <div
            aria-live="polite"
            className="fixed z-[70] inset-x-3 bottom-24 sm:bottom-6 sm:left-auto sm:right-6 flex flex-col items-end gap-2 pointer-events-none"
        >
            {toasts.map((toast: any) => (
                <ToastItem key={toast.id} toast={toast} />
            ))}
        </div>
    );
};

export default Toaster;
