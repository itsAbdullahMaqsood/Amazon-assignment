import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../store";

// Shabana's conversation lives here rather than in the panel, so it survives
// closing the panel and moving between pages, and so anything on a page can
// open Shabana with a question (the home hero's examples, "Ask about this
// product") without reaching into the panel.
export interface ShabanaMessage {
    role: "user" | "assistant";
    content: string;
    groups?: any[];
    followUps?: string[];
    link?: { href: string; label: string } | null;
    unavailable?: boolean;
}

interface AssistantState {
    open: boolean;
    messages: ShabanaMessage[];
    loading: boolean;
    error: string;
    // Products the conversation is about; the server loads them from MongoDB.
    context: { id: string; name: string }[];
}

const initialState: AssistantState = { open: false, messages: [], loading: false, error: "", context: [] };

export const askShabana = createAsyncThunk("assistant/ask", async (question: string, { getState, rejectWithValue }) => {
    const { assistant } = getState() as RootState;
    const history = [...assistant.messages, { role: "user", content: question }];

    try {
        const { data } = await axios.post("/api/shabana/chat", {
            messages: history.map((message: any) => ({ role: message.role, content: message.content })),
            productIds: assistant.context.map((product) => product.id),
        });

        return data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Shabana couldn't answer just now.");
    }
});

export const AssistantSlice = createSlice({
    name: "assistant",
    initialState,
    reducers: {
        openPanel: (state, action: PayloadAction<{ context?: { id: string; name: string }[] } | undefined>) => {
            state.open = true;

            // A new product to talk about starts a new conversation.
            const context = action.payload?.context;
            if (context && context.map((c) => c.id).join() !== state.context.map((c) => c.id).join()) {
                state.context = context;
                state.messages = [];
                state.error = "";
            }
        },
        closeAssistant: (state) => {
            state.open = false;
        },
        newConversation: (state) => {
            state.messages = [];
            state.error = "";
            state.context = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(askShabana.pending, (state, action) => {
                state.messages.push({ role: "user", content: action.meta.arg });
                state.loading = true;
                state.error = "";
            })
            .addCase(askShabana.fulfilled, (state, action) => {
                state.loading = false;
                state.messages.push({
                    role: "assistant",
                    content: action.payload.reply,
                    groups: action.payload.groups,
                    followUps: action.payload.followUps,
                    link: action.payload.link,
                    unavailable: action.payload.unavailable,
                });
            })
            .addCase(askShabana.rejected, (state, action) => {
                state.loading = false;
                state.error = String(action.payload || "Shabana couldn't answer just now.");
            });
    },
});

export const { openPanel, closeAssistant, newConversation } = AssistantSlice.actions;

// Opens the panel and, when given a question, asks it straight away.
export const openAssistant =
    ({ prompt, context }: { prompt?: string; context?: { id: string; name: string }[] } = {}) =>
    (dispatch: any) => {
        dispatch(openPanel({ context }));

        if (prompt) {
            dispatch(askShabana(prompt));
        }
    };

export const selectAssistant = (state: RootState) => state.assistant;

export default AssistantSlice.reducer;
