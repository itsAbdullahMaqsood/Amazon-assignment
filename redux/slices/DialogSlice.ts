import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface DialogMsg {
    msg: string;
    type: string;
}

interface DialogState {
    show: boolean;
    header: string;
    msgs: DialogMsg[];
}

const initialState: DialogState = {
    show: false,
    header: "",
    msgs: [],
};

export const DialogSlice = createSlice({
    name: "dialog",
    initialState,
    reducers: {
        showDialog: (state, action: PayloadAction<any>) => {
            state.show = true;
            state.header = action.payload.header;
            state.msgs = action.payload.msgs;
        },
        hideDialog: (state) => {
            state.show = false;
            state.header = "";
            state.msgs = [];
        },
    },
});

export const { showDialog, hideDialog } = DialogSlice.actions;

export const selectDialog = (state: RootState) => state.dialog;

export default DialogSlice.reducer;
