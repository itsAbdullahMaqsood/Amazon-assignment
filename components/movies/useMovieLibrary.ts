"use client";

import { useMemo, useState } from "react";
import axios from "axios";

import { useAppDispatch } from "@/redux/hooks";
import { pushToast } from "@/redux/slices/ToastSlice";
import { rentalLive } from "@/lib/movies";

// My list and the library live on the account, so every change is a round trip
// and the server's answer replaces the local copy. The client never computes a
// price or an expiry date.
const useMovieLibrary = (initial: any) => {
    const dispatch = useAppDispatch();
    const [state, setState] = useState<any>({ list: initial?.list || [], library: initial?.library || [] });
    const [busy, setBusy] = useState("");

    const run = async (key: string, request: () => Promise<any>) => {
        setBusy(key);

        try {
            const { data } = await request();
            setState({ list: data.list, library: data.library });

            if (data.message) {
                dispatch(pushToast({ title: data.message }));
            }
        } catch (error: any) {
            dispatch(pushToast({ title: "That didn't work", body: error.response?.data?.message || "Try again.", tone: "danger" }));
        } finally {
            setBusy("");
        }
    };

    const save = (title: any) => run("save", () => axios.post("/api/user/movies", { videoId: title._id, action: "save" }));
    const remove = (title: any) => run("save", () => axios.delete("/api/user/movies", { data: { videoId: title._id } }));
    const acquire = (title: any, action: string) => run(action, () => axios.post("/api/user/movies", { videoId: title._id, action }));

    const savedIds = useMemo(() => new Set(state.list.map((entry: any) => entry.video._id)), [state.list]);

    // A title can have been rented and later bought; owning it wins, then a
    // rental that is still running, then the last expired one.
    const entries = useMemo(() => {
        const best = new Map<string, any>();

        for (const entry of state.library) {
            const id = entry.video._id;
            const current = best.get(id);
            const rank = (value: any) => (value.type === "buy" ? 2 : rentalLive(value) ? 1 : 0);

            if (!current || rank(entry) > rank(current)) {
                best.set(id, entry);
            }
        }

        return best;
    }, [state.library]);

    return { ...state, busy, savedIds, entries, save, remove, acquire };
};

export default useMovieLibrary;
