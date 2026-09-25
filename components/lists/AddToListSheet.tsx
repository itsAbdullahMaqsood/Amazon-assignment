"use client";

import { useState } from "react";
import axios from "axios";
import { PlusIcon } from "@heroicons/react/24/outline";

import Button from "@/components/ui/Button";
import Sheet from "@/components/ui/Sheet";
import { Notice } from "@/components/ui/Layout";
import { privacyLabel } from "@/lib/lists";
import { useAppDispatch } from "@/redux/hooks";
import { pushToast } from "@/redux/slices/ToastSlice";
import ListFormSheet from "./ListFormSheet";

// Saved items is where things go into lists: one save gesture on the product
// page, and organising afterwards. The sheet loads your lists when it opens, so
// a list made in another tab is there.
const AddToListSheet = ({ item, open, onClose }: any) => {
    const dispatch = useAppDispatch();
    const [lists, setLists] = useState<any[] | null>(null);
    const [creating, setCreating] = useState(false);
    const [busy, setBusy] = useState("");
    const [error, setError] = useState("");

    const load = async () => {
        try {
            const { data } = await axios.get("/api/user/lists");
            setLists(data.lists);
        } catch (err: any) {
            setError(err.response?.data?.message || "Your lists couldn't be loaded.");
            setLists([]);
        }
    };

    if (open && lists === null && !error) {
        load();
    }

    const addTo = async (list: any) => {
        setError("");
        setBusy(list._id);

        try {
            const { data } = await axios.put("/api/user/lists", {
                list_id: list._id,
                product_id: item.productId,
                style: item.style,
            });
            dispatch(pushToast({ title: data.message, image: item.image, secondary: { label: "Open list", href: `/lists/${list._id}` } }));
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || "That couldn't be added.");
        } finally {
            setBusy("");
        }
    };

    return (
        <>
            <Sheet open={open} onClose={onClose} side="right" title="Add to a list" description={item?.name}>
                {error && <Notice tone="danger" className="mb-4">{error}</Notice>}

                {lists === null ? (
                    <p className="text-sm text-fg-muted">Loading your lists…</p>
                ) : lists.length === 0 ? (
                    <p className="text-sm text-fg-muted">You have no lists yet. Make one and this goes straight into it.</p>
                ) : (
                    <ul className="divide-y divide-line border-y border-line">
                        {lists.map((list: any) => (
                            <li key={list._id}>
                                <button
                                    type="button"
                                    onClick={() => addTo(list)}
                                    disabled={busy === list._id}
                                    className="flex w-full items-center justify-between gap-3 py-3 text-left cursor-pointer disabled:opacity-50"
                                >
                                    <span className="min-w-0">
                                        <span className="block text-sm font-medium text-fg">{list.name}</span>
                                        <span className="block text-xs text-fg-muted">
                                            {list.count} item{list.count === 1 ? "" : "s"} · {privacyLabel(list.privacy).toLowerCase()}
                                        </span>
                                    </span>
                                    <span className="text-sm text-link">Add</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                <Button variant="outline" className="mt-5" onClick={() => setCreating(true)}>
                    <PlusIcon className="h-5 w-5" />
                    New list
                </Button>
            </Sheet>

            <ListFormSheet
                open={creating}
                onClose={() => setCreating(false)}
                onSaved={(data: any) => {
                    setCreating(false);
                    setLists(data.lists);
                    const made = data.lists.find((entry: any) => entry._id === data.id);
                    if (made) addTo(made);
                }}
            />
        </>
    );
};

export default AddToListSheet;
