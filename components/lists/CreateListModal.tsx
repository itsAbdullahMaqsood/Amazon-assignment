"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { MAX_NAME, privacyOptions, validateName } from "@/lib/lists";

const CreateListModal = ({ existing, onClose, onCreated }: any) => {
    const [name, setName] = useState<string>("");
    const [privacy, setPrivacy] = useState<string>("private");
    const [error, setError] = useState<string>("");
    const [saving, setSaving] = useState<boolean>(false);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();

        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    const submitHandler = async (e: any) => {
        e.preventDefault();

        const invalid = validateName(name, existing);

        if (invalid) {
            setError(invalid);
            return;
        }

        try {
            setSaving(true);
            const { data } = await axios.post("/api/user/lists", { name: name.trim(), privacy });
            onCreated(data.lists);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 pt-24"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Create a new list"
                className="w-full max-w-md bg-white rounded-lg shadow-2xl"
            >
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                    <h2 className="text-lg font-bold">Create a new list</h2>

                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="p-1 rounded hover:bg-slate-100 cursor-pointer"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={submitHandler} className="px-5 py-4 space-y-4">
                    <div>
                        <label htmlFor="list-name" className="block text-sm font-bold mb-1">
                            List name
                        </label>

                        <input
                            id="list-name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError("");
                            }}
                            maxLength={MAX_NAME}
                            autoFocus
                            placeholder="Birthday ideas"
                            className="w-full border border-slate-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e77600]"
                        />

                        <p className="text-xs text-slate-500 mt-1">
                            {MAX_NAME - name.trim().length} characters left
                        </p>
                    </div>

                    <fieldset>
                        <legend className="text-sm font-bold mb-1">Privacy</legend>

                        <div className="space-y-2">
                            {privacyOptions.map((option) => (
                                <label
                                    key={option.value}
                                    className="flex items-start gap-2 text-sm cursor-pointer"
                                >
                                    <input
                                        type="radio"
                                        name="privacy"
                                        value={option.value}
                                        checked={privacy === option.value}
                                        onChange={() => setPrivacy(option.value)}
                                        className="mt-1 cursor-pointer"
                                    />
                                    <span>
                                        <span className="font-semibold">{option.label}</span>
                                        <span className="block text-xs text-slate-600">
                                            {option.hint}
                                        </span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    {error && (
                        <p role="alert" className="text-sm text-[#C40000]">
                            {error}
                        </p>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-sm text-[#007185] hover:underline cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="button-orange px-6 py-1.5 text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {saving ? "Creating..." : "Create List"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateListModal;
