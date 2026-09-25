import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

// Short confirmations ("Added to your cart") that float above the page and go
// away on their own. `action` is an optional link rendered on the toast.
export interface Toast {
    id: number;
    title: string;
    body?: string;
    tone?: "neutral" | "success" | "danger";
    image?: string;
    action?: { label: string; href: string };
    secondary?: { label: string; href: string };
}

interface ToastState {
    items: Toast[];
}

const initialState: ToastState = { items: [] };

let nextId = 1;

export const ToastSlice = createSlice({
    name: "toast",
    initialState,
    reducers: {
        pushToast: {
            reducer: (state, action: PayloadAction<Toast>) => {
                // One at a time reads better than a stack for this store's actions.
                state.items = [action.payload];
            },
            prepare: (toast: Omit<Toast, "id">) => ({ payload: { ...toast, id: nextId++ } }),
        },
        dismissToast: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter((toast) => toast.id !== action.payload);
        },
    },
});

export const { pushToast, dismissToast } = ToastSlice.actions;

export const selectToasts = (state: RootState) => state.toast.items;

export default ToastSlice.reducer;
