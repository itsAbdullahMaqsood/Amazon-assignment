"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
    ArchiveBoxArrowDownIcon,
    ArrowUturnLeftIcon,
    ChevronLeftIcon,
    EnvelopeIcon,
    EnvelopeOpenIcon,
    InboxIcon,
} from "@heroicons/react/24/outline";

import { folders, formatDate } from "@/lib/messages";

const KEY = "amazon:messages";
const EMPTY: any = { read: [], archived: [] };

// Read and archive state is the one thing the server cannot know, so it lives in
// localStorage behind a tiny store. useSyncExternalStore gives the server (and
// the hydration pass) the empty snapshot, which is exactly what the markup below
// renders without it: everything unread, nothing archived.
const listeners = new Set<() => void>();
let storageWorks = true;
let cachedRaw: string | null = null;
let cachedValue: any = EMPTY;

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    window.addEventListener("storage", listener);

    return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", listener);
    };
};

const getSnapshot = () => {
    if (!storageWorks) {
        return cachedValue;
    }

    let raw = "";

    // Access throws outright in private mode and in some embedded browsers.
    try {
        raw = window.localStorage.getItem(KEY) || "";
    } catch {
        storageWorks = false;

        return cachedValue;
    }

    if (raw !== cachedRaw) {
        cachedRaw = raw;

        try {
            cachedValue = raw ? JSON.parse(raw) : EMPTY;
        } catch {
            cachedValue = EMPTY;
        }
    }

    return cachedValue;
};

const getServerSnapshot = () => EMPTY;

const write = (next: any) => {
    const serialized = JSON.stringify(next);

    try {
        window.localStorage.setItem(KEY, serialized);
        cachedRaw = serialized;
    } catch {
        storageWorks = false;
    }

    cachedValue = next;
    listeners.forEach((listener) => listener());
};

const toggle = (list: string[], id: string, on: boolean) =>
    on ? Array.from(new Set([...list, id])) : list.filter((entry) => entry !== id);

const MessagesClient = ({ messages }: any) => {
    const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const [folder, setFolder] = useState("inbox");
    const [selectedId, setSelectedId] = useState("");

    const read = new Set<string>(state.read || []);
    const archived = new Set<string>(state.archived || []);

    const inFolder = (value: string) =>
        value === "archived"
            ? messages.filter((message: any) => archived.has(message.id))
            : messages.filter(
                  (message: any) => message.folder === value && !archived.has(message.id)
              );

    // Nothing in the Sent folder was ever addressed to this user, so it never
    // counts as unread.
    const isUnread = (message: any) => message.folder !== "sent" && !read.has(message.id);

    const listed = inFolder(folder);
    // The selection is validated during render rather than reset from an effect,
    // so switching folders simply drops a selection that no longer belongs.
    const selected = listed.find((message: any) => message.id === selectedId) || null;

    const setRead = (id: string, on: boolean) => {
        write({ ...state, read: toggle(state.read || [], id, on) });
    };

    const setArchived = (id: string, on: boolean) => {
        write({ ...state, archived: toggle(state.archived || [], id, on) });
        setSelectedId("");
    };

    const openHandler = (message: any) => {
        setSelectedId(message.id);
        setRead(message.id, true);
    };

    const folderHandler = (value: string) => {
        setFolder(value);
        setSelectedId("");
    };

    return (
        <div className="flex flex-col md:flex-row gap-6">
            <nav aria-label="Message folders" className="md:w-56 shrink-0">
                <ul className="border border-slate-300 rounded-lg overflow-hidden">
                    {folders.map((entry) => {
                        const items = inFolder(entry.value);
                        const unread = items.filter(isUnread).length;

                        return (
                            <li key={entry.value}>
                                <button
                                    onClick={() => folderHandler(entry.value)}
                                    aria-current={folder === entry.value ? "true" : undefined}
                                    className={`w-full flex items-center gap-2 text-left text-sm px-3 py-2.5 border-b border-slate-200 last:border-b-0 cursor-pointer hover:bg-slate-100 ${
                                        folder === entry.value ? "bg-slate-100 font-bold" : ""
                                    }`}
                                >
                                    <span className="grow">{entry.label}</span>
                                    {unread > 0 && (
                                        <span className="text-xs font-bold text-[#C7511F]">
                                            {unread}
                                        </span>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>

                <p className="text-xs text-slate-500 mt-3 px-1">
                    Read and archived state is remembered in this browser only.
                </p>
            </nav>

            <section className="grow border border-slate-300 rounded-lg min-h-[420px]">
                {selected ? (
                    <article>
                        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
                            <button
                                onClick={() => setSelectedId("")}
                                className="flex items-center text-sm text-[#007185] hover:underline cursor-pointer"
                            >
                                <ChevronLeftIcon className="h-4" />
                                Back to {folders.find((entry) => entry.value === folder)?.label}
                            </button>

                            <div className="ml-auto flex items-center gap-4">
                                <button
                                    onClick={() => setRead(selected.id, false)}
                                    className="flex items-center gap-1 text-sm text-[#007185] hover:underline cursor-pointer"
                                >
                                    <EnvelopeIcon className="h-4" />
                                    Mark as unread
                                </button>

                                <button
                                    onClick={() => setArchived(selected.id, !archived.has(selected.id))}
                                    className="flex items-center gap-1 text-sm text-[#007185] hover:underline cursor-pointer"
                                >
                                    {archived.has(selected.id) ? (
                                        <ArrowUturnLeftIcon className="h-4" />
                                    ) : (
                                        <ArchiveBoxArrowDownIcon className="h-4" />
                                    )}
                                    {archived.has(selected.id) ? "Move to Inbox" : "Archive"}
                                </button>
                            </div>
                        </div>

                        <div className="p-5">
                            <h2 className="text-xl font-bold">{selected.subject}</h2>
                            <p className="text-sm text-slate-600 mt-1">
                                From <span className="font-semibold">{selected.from}</span> ·{" "}
                                {formatDate(selected.date)}
                            </p>

                            <div className="mt-4 space-y-3 text-sm leading-6 max-w-2xl">
                                {selected.body.map((paragraph: string, i: number) => (
                                    <p key={i}>{paragraph}</p>
                                ))}
                            </div>

                            {selected.href && (
                                <Link
                                    href={selected.href}
                                    className="inline-block mt-6 px-6 py-2 rounded-full bg-linear-to-r from-amazon-orange to-yellow-300 text-amazon-blue_dark"
                                >
                                    View order details
                                </Link>
                            )}
                        </div>
                    </article>
                ) : listed.length === 0 ? (
                    <div className="p-10 text-center">
                        <InboxIcon className="h-10 mx-auto text-slate-400" />
                        <p className="font-semibold mt-3">There are no messages in this folder.</p>
                        <p className="text-sm text-slate-600 mt-1">
                            Messages about your orders appear here as soon as you place one.
                        </p>
                        <Link
                            href="/profile/orders"
                            className="inline-block mt-5 px-6 py-2 rounded-full bg-linear-to-r from-amazon-orange to-yellow-300 text-amazon-blue_dark"
                        >
                            Go to Your Orders
                        </Link>
                    </div>
                ) : (
                    <ul>
                        {listed.map((message: any) => {
                            const unread = isUnread(message);

                            return (
                                <li
                                    key={message.id}
                                    className="border-b border-slate-200 last:border-b-0"
                                >
                                    <div className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50">
                                        {unread ? (
                                            <EnvelopeIcon className="h-5 shrink-0 mt-0.5 text-[#C7511F]" />
                                        ) : (
                                            <EnvelopeOpenIcon className="h-5 shrink-0 mt-0.5 text-slate-400" />
                                        )}

                                        <button
                                            onClick={() => openHandler(message)}
                                            className="grow text-left cursor-pointer"
                                        >
                                            <p className="text-xs text-slate-600">{message.from}</p>
                                            <p
                                                className={`text-sm ${unread ? "font-bold" : ""} text-[#0F5FA6]`}
                                            >
                                                {message.subject}
                                            </p>
                                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                                                {message.snippet}
                                            </p>
                                        </button>

                                        <div className="shrink-0 text-right">
                                            <p className="text-xs text-slate-600">
                                                {formatDate(message.date)}
                                            </p>
                                            <button
                                                onClick={() =>
                                                    setArchived(message.id, !archived.has(message.id))
                                                }
                                                className="text-xs text-[#007185] hover:underline cursor-pointer mt-1"
                                            >
                                                {archived.has(message.id) ? "Restore" : "Archive"}
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default MessagesClient;
