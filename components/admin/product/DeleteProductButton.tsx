"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { TrashIcon } from "@heroicons/react/24/outline";

import { useAppDispatch } from "@/redux/hooks";
import { showDialog } from "@/redux/slices/DialogSlice";
import { btn } from "@/components/admin/ui";

const DeleteProductButton = ({ id, name }: any) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [busy, setBusy] = useState<boolean>(false);

    const onDelete = async () => {
        if (!window.confirm(`Delete "${name}"? Its images are removed from Cloudinary too. This cannot be undone.`)) {
            return;
        }

        try {
            setBusy(true);
            const { data } = await axios.delete(`/api/admin/product/${id}`);
            dispatch(showDialog({ header: "Product deleted", msgs: [{ msg: data.message, type: "success" }] }));
            router.refresh();
        } catch (error: any) {
            dispatch(
                showDialog({
                    header: "Delete failed",
                    msgs: [{ msg: error.response?.data?.message || error.message, type: "error" }],
                })
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <button onClick={onDelete} disabled={busy} aria-label={`Delete ${name}`} title="Delete" className={btn.icon}>
            <TrashIcon className="w-5 h-5 text-red-600" />
        </button>
    );
};

export default DeleteProductButton;
