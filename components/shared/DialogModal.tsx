"use client";

import { useEffect } from "react";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { hideDialog, selectDialog } from "@/redux/slices/DialogSlice";

const DialogModal = () => {
    const dispatch = useAppDispatch();
    const dialog = useAppSelector(selectDialog);
    const hasError = dialog.msgs.some((msg: any) => msg.type === "error");

    const closeHandler = () => {
        dispatch(hideDialog());
    };

    useEffect(() => {
        const escapeHandler = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                dispatch(hideDialog());
            }
        };

        window.addEventListener("keydown", escapeHandler);
        return () => window.removeEventListener("keydown", escapeHandler);
    }, [dispatch]);

    if (!dialog.show) {
        return null;
    }

    return (
        <div
            onClick={closeHandler}
            className="fixed top-0 left-0 w-full h-full bg-black/40 z-50 flex items-center justify-center"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm mx-3 bg-white rounded shadow-lg overflow-hidden"
            >
                <div
                    className={`px-4 py-2 font-semibold ${
                        hasError ? "bg-red-500 text-white" : "bg-green-500 text-slate-800"
                    }`}
                >
                    {dialog.header}
                </div>

                <div className="p-4 space-y-3">
                    {dialog.msgs.map((msg: any, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                            {msg.type === "error" ? (
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 shrink-0" />
                            ) : (
                                <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0" />
                            )}
                            <span>{msg.msg}</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end p-4 pt-0">
                    <button
                        onClick={closeHandler}
                        className="button-orange px-8 py-1.5 text-sm cursor-pointer"
                    >
                        Ok
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DialogModal;
