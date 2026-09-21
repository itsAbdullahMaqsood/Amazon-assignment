"use client";

import { useEffect } from "react";

const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Keeps Tab inside an open dialog, closes it on Escape, and hands focus back to
// whatever opened it when it closes.
const useFocusTrap = (ref: any, active: boolean, onClose?: () => void) => {
    useEffect(() => {
        if (!active || !ref.current) {
            return;
        }

        const root: HTMLElement = ref.current;
        const opener = document.activeElement as HTMLElement | null;
        const items = () => [...root.querySelectorAll<HTMLElement>(FOCUSABLE)];

        (items()[0] || root).focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && onClose) {
                event.stopPropagation();
                onClose();
                return;
            }

            if (event.key !== "Tab") {
                return;
            }

            const list = items();

            if (list.length === 0) {
                event.preventDefault();
                return;
            }

            const first = list[0];
            const last = list[list.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            opener?.focus?.();
        };
    }, [ref, active, onClose]);
};

export default useFocusTrap;
