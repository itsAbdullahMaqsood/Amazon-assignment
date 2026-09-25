"use client";

import { useState, useSyncExternalStore } from "react";
import axios from "axios";
import {
    EnvelopeIcon,
    EyeIcon,
    LanguageIcon,
    MegaphoneIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";

import {
    defaultPreferences,
    parsePreferences,
    preferencesSnapshot,
    sections,
    serverPreferencesSnapshot,
    subscribePreferences,
    writePreferences,
} from "@/lib/preferences";

const icons: any = { LanguageIcon, SparklesIcon, EnvelopeIcon, EyeIcon, MegaphoneIcon };

const Switch = ({ id, label, hint, checked, onChange }: any) => (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-slate-200 last:border-b-0">
        <div>
            <label htmlFor={id} className="font-medium">
                {label}
            </label>
            {hint && <p className="text-sm text-slate-600 mt-0.5">{hint}</p>}
        </div>

        <button
            id={id}
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`shrink-0 w-12 h-6 rounded-full transition-colors cursor-pointer relative ${
                checked ? "bg-ink-800" : "bg-slate-300"
            }`}
        >
            <span className="sr-only">{label}</span>
            <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    checked ? "translate-x-6" : ""
                }`}
            />
        </button>
    </div>
);

const PreferencesClient = () => {
    // The saved values are an external store, so hydration renders the defaults
    // and the browser's copy arrives on the first client render instead of from
    // an effect.
    const raw = useSyncExternalStore(
        subscribePreferences,
        preferencesSnapshot,
        serverPreferencesSnapshot
    );
    const saved = parsePreferences(raw);

    const [pending, setPending] = useState<any>({});
    const [savedMessage, setSavedMessage] = useState<string>("");
    const [historyState, setHistoryState] = useState<any>({ message: "", error: "", busy: false });

    const values = { ...saved, ...pending };
    const dirty = Object.keys(pending).some((key) => pending[key] !== saved[key]);

    const changeHandler = (key: string, value: any) => {
        setPending({ ...pending, [key]: value });
        setSavedMessage("");
    };

    const saveHandler = () => {
        const stored = writePreferences(values);

        setPending({});
        setSavedMessage(
            `Your preferences were saved at ${new Date(stored.savedAt).toLocaleTimeString()}.`
        );
    };

    const cancelHandler = () => {
        setPending({});
        setSavedMessage("");
    };

    const resetHandler = () => {
        setPending({ ...defaultPreferences });
        setSavedMessage("");
    };

    // Turning the browsing-history switch off only stops future use; this empties
    // what is already stored on the account.
    const clearHistoryHandler = async () => {
        try {
            setHistoryState({ message: "", error: "", busy: true });

            const { data } = await axios.delete("/api/user/history");

            setHistoryState({ message: data.message, error: "", busy: false });
        } catch (error: any) {
            setHistoryState({
                message: "",
                error: error.response?.data?.message || error.message,
                busy: false,
            });
        }
    };

    return (
        <div className="space-y-6">
            {savedMessage && (
                <div
                    role="status"
                    className="border border-green-600 bg-green-50 text-green-800 rounded-lg px-4 py-3 text-sm"
                >
                    {savedMessage}
                </div>
            )}

            {sections.map((section: any) => {
                const Icon = icons[section.icon];

                return (
                    <section
                        key={section.id}
                        className="bg-white border border-slate-300 rounded-lg p-5"
                    >
                        <div className="flex items-start gap-3">
                            <Icon className="h-6 w-6 text-ink-800 shrink-0 mt-0.5" />
                            <div>
                                <h2 className="text-lg font-bold">{section.title}</h2>
                                <p className="text-sm text-slate-600">{section.description}</p>
                            </div>
                        </div>

                        {section.choices.length > 0 && (
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                {section.choices.map((choice: any) => (
                                    <div key={choice.id}>
                                        <label
                                            htmlFor={choice.id}
                                            className="block text-sm font-medium mb-1"
                                        >
                                            {choice.label}
                                        </label>
                                        <select
                                            id={choice.id}
                                            value={values[choice.id]}
                                            onChange={(e) =>
                                                changeHandler(choice.id, e.target.value)
                                            }
                                            className="w-full text-sm p-2.5 rounded border border-slate-300 bg-white outline-none"
                                        >
                                            {choice.options.map((option: any) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        {choice.hint && (
                                            <p className="text-xs text-slate-500 mt-1">
                                                {choice.hint}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {section.toggles.length > 0 && (
                            <div className="mt-2">
                                {section.toggles.map((toggle: any) => (
                                    <Switch
                                        key={toggle.id}
                                        id={toggle.id}
                                        label={toggle.label}
                                        hint={toggle.hint}
                                        checked={Boolean(values[toggle.id])}
                                        onChange={(next: boolean) =>
                                            changeHandler(toggle.id, next)
                                        }
                                    />
                                ))}
                            </div>
                        )}

                        {section.id === "content" && (
                            <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-4">
                                <p className="font-medium">Remove all items from browsing history</p>
                                <p className="text-sm text-slate-600 mt-0.5">
                                    Deletes every product stored against your account. This cannot be
                                    undone.
                                </p>

                                <button
                                    type="button"
                                    onClick={clearHistoryHandler}
                                    disabled={historyState.busy}
                                    className="mt-3 px-5 py-2 text-sm rounded-full border border-slate-400 bg-white hover:bg-slate-100 cursor-pointer disabled:opacity-60"
                                >
                                    {historyState.busy ? "Removing…" : "Remove all items"}
                                </button>

                                {historyState.message && (
                                    <p className="text-sm text-green-700 mt-2">
                                        {historyState.message}
                                    </p>
                                )}
                                {historyState.error && (
                                    <p className="text-sm text-red-600 mt-2">{historyState.error}</p>
                                )}
                            </div>
                        )}
                    </section>
                );
            })}

            <div className="sticky bottom-0 bg-white border border-slate-300 rounded-lg p-4 flex flex-wrap items-center gap-3 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
                <button
                    type="button"
                    onClick={saveHandler}
                    disabled={!dirty}
                    className="button-orange px-8 py-2 text-sm text-gray-900 cursor-pointer disabled:opacity-50 disabled:cursor-default"
                >
                    Save changes
                </button>

                <button
                    type="button"
                    onClick={cancelHandler}
                    disabled={!dirty}
                    className="px-6 py-2 text-sm rounded border border-slate-400 cursor-pointer disabled:opacity-50 disabled:cursor-default"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={resetHandler}
                    className="text-sm text-accent-ink hover:underline cursor-pointer"
                >
                    Reset to defaults
                </button>

                <span className="text-sm text-slate-600 ml-auto">
                    {dirty
                        ? "You have unsaved changes."
                        : saved.savedAt
                          ? `Last saved ${new Date(saved.savedAt).toLocaleString()}.`
                          : "Preferences are stored in this browser."}
                </span>
            </div>
        </div>
    );
};

export default PreferencesClient;
