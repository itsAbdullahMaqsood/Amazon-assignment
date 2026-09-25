"use client";

import { useState, useSyncExternalStore } from "react";
import axios from "axios";
import { signOut } from "next-auth/react";
import {
    ArrowDownTrayIcon,
    ClockIcon,
    DocumentTextIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";

const REQUESTS_KEY = "markaz_data_requests";

const categories = [
    {
        value: "orders",
        label: "Your Orders",
        hint: "Every order on this account: items, totals, addresses, payment method and returns.",
    },
    {
        value: "history",
        label: "Browsing history",
        hint: "The products you have opened, most recent first.",
    },
    {
        value: "account",
        label: "Account information",
        hint: "Name, email, saved addresses and default payment method.",
    },
    {
        value: "all",
        label: "Everything above",
        hint: "Adds your cart and your saved lists to the same file.",
    },
];

const labelFor = (value: string) =>
    categories.find((category) => category.value === value)?.label || value;

// The request log is a browser-side record of what was downloaded and when; the
// export itself is always assembled fresh on the server.
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    window.addEventListener("storage", notify);

    return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", notify);
    };
};

const snapshot = () => {
    try {
        return window.localStorage.getItem(REQUESTS_KEY) || "";
    } catch {
        return "";
    }
};

const serverSnapshot = () => "";

const parseRequests = (raw: string) => {
    try {
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const saveRequests = (entries: any[]) => {
    try {
        window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(entries.slice(0, 20)));
    } catch {
        // Blocked storage just means the log is not kept.
    }

    notify();
};

const storedData = [
    {
        title: "Who you are",
        body: "Your name and email address, and a bcrypt hash of your password. The password itself is never stored and never appears in an export. Accounts created through Google or GitHub carry a random hash instead.",
    },
    {
        title: "Where things go",
        body: "Any delivery addresses you have saved, including the phone number on them, and which one is marked as the default.",
    },
    {
        title: "What is in your cart",
        body: "The cart is stored against your account so it follows you between devices: product, size, colour, quantity and the price at the time.",
    },
    {
        title: "What you have ordered",
        body: "Orders keep the items, totals, tax and shipping, the delivery address used, the payment method name, the payment status and any return requests.",
    },
    {
        title: "What you have looked at",
        body: "Browsing history stores the product, the colour variant and the time you opened it. It is used for recommendations unless you turn that off in your shopping preferences.",
    },
    {
        title: "What you have saved",
        body: "Named lists and saved items, with the privacy setting you chose for each list.",
    },
];

const DataClient = ({ email }: any) => {
    const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
    const requests = parseRequests(raw);

    const [category, setCategory] = useState<string>("orders");
    const [download, setDownload] = useState<any>({ busy: false, message: "", error: "" });

    const [closeStep, setCloseStep] = useState<number>(0);
    const [understood, setUnderstood] = useState<boolean>(false);
    const [typedEmail, setTypedEmail] = useState<string>("");
    const [closing, setClosing] = useState<any>({ busy: false, error: "", done: "" });

    const downloadHandler = async () => {
        try {
            setDownload({ busy: true, message: "", error: "" });

            const response = await axios.get(`/api/user/data?category=${category}`, {
                responseType: "blob",
            });

            const disposition = String(response.headers["content-disposition"] || "");
            const match = disposition.match(/filename="?([^"]+)"?/);
            const filename = match?.[1] || `markaz-data-${category}.json`;

            const url = URL.createObjectURL(response.data);
            const anchor = document.createElement("a");

            anchor.href = url;
            anchor.download = filename;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);

            saveRequests([
                {
                    id: `${Date.now()}`,
                    category,
                    filename,
                    requestedAt: new Date().toISOString(),
                    sizeKb: Math.max(1, Math.round(response.data.size / 1024)),
                },
                ...requests,
            ]);

            setDownload({
                busy: false,
                message: `${labelFor(category)} downloaded as ${filename}.`,
                error: "",
            });
        } catch (error: any) {
            // With responseType blob the error body arrives as a blob too.
            let message = error.message;

            try {
                const text = await error.response?.data?.text?.();
                message = JSON.parse(text || "{}").message || message;
            } catch {
                // Keep the axios message.
            }

            setDownload({ busy: false, message: "", error: message });
        }
    };

    const closeAccountHandler = async () => {
        try {
            setClosing({ busy: true, error: "", done: "" });

            const { data } = await axios.delete("/api/user/account", {
                data: { confirm: true, email: typedEmail },
            });

            setClosing({
                busy: false,
                error: "",
                done: `${data.message} Signing you out…`,
            });

            await signOut({ callbackUrl: "/" });
        } catch (error: any) {
            setClosing({
                busy: false,
                error: error.response?.data?.message || error.message,
                done: "",
            });
        }
    };

    const dismissDialog = () => {
        setCloseStep(0);
        setUnderstood(false);
        setTypedEmail("");
        setClosing({ busy: false, error: "", done: "" });
    };

    return (
        <div className="space-y-6">
            <section className="bg-white border border-slate-300 rounded-lg p-5">
                <div className="flex items-start gap-3">
                    <ArrowDownTrayIcon className="h-6 w-6 text-ink-800 shrink-0 mt-0.5" />
                    <div>
                        <h2 className="text-lg font-bold">Request your data</h2>
                        <p className="text-sm text-slate-600">
                            Choose a category and we will assemble a JSON file from your own records
                            and download it now.
                        </p>
                    </div>
                </div>

                <fieldset className="mt-4">
                    <legend className="sr-only">Data category</legend>

                    <div className="grid gap-2 sm:grid-cols-2">
                        {categories.map((option) => (
                            <label
                                key={option.value}
                                className={`flex items-start gap-2 p-3 rounded border cursor-pointer ${
                                    category === option.value
                                        ? "border-ink-800 bg-slate-50"
                                        : "border-slate-300"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="data-category"
                                    value={option.value}
                                    checked={category === option.value}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="mt-1"
                                />
                                <span className="text-sm">
                                    <span className="font-semibold block">{option.label}</span>
                                    <span className="text-slate-500">{option.hint}</span>
                                </span>
                            </label>
                        ))}
                    </div>
                </fieldset>

                <button
                    type="button"
                    onClick={downloadHandler}
                    disabled={download.busy}
                    className="button-orange mt-4 px-8 py-2 text-sm text-gray-900 cursor-pointer disabled:opacity-60"
                >
                    {download.busy ? "Preparing…" : "Request data"}
                </button>

                {download.message && (
                    <p className="text-sm text-green-700 mt-3">{download.message}</p>
                )}
                {download.error && <p className="text-sm text-red-600 mt-3">{download.error}</p>}
            </section>

            <section className="bg-white border border-slate-300 rounded-lg p-5">
                <div className="flex items-start gap-3">
                    <ClockIcon className="h-6 w-6 text-ink-800 shrink-0 mt-0.5" />
                    <div>
                        <h2 className="text-lg font-bold">Data access and requests</h2>
                        <p className="text-sm text-slate-600">
                            Requests made from this browser. Markaz does not keep a copy of the file.
                        </p>
                    </div>
                </div>

                {requests.length === 0 ? (
                    <p className="text-sm text-slate-600 mt-4">
                        You have not requested any data from this browser yet.
                    </p>
                ) : (
                    <>
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full min-w-[520px] text-sm border border-slate-200">
                                <thead className="bg-slate-100 text-left">
                                    <tr>
                                        <th scope="col" className="p-2 font-semibold">
                                            Requested
                                        </th>
                                        <th scope="col" className="p-2 font-semibold">
                                            Category
                                        </th>
                                        <th scope="col" className="p-2 font-semibold">
                                            File
                                        </th>
                                        <th scope="col" className="p-2 font-semibold">
                                            Size
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map((entry: any) => (
                                        <tr key={entry.id} className="border-t border-slate-200">
                                            <td className="p-2">
                                                {new Date(entry.requestedAt).toLocaleString()}
                                            </td>
                                            <td className="p-2">{labelFor(entry.category)}</td>
                                            <td className="p-2 text-slate-600">{entry.filename}</td>
                                            <td className="p-2 text-slate-600">
                                                {entry.sizeKb} KB
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button
                            type="button"
                            onClick={() => saveRequests([])}
                            className="mt-3 inline-flex items-center gap-1 text-sm text-accent-ink hover:underline cursor-pointer"
                        >
                            <TrashIcon className="h-4 w-4" />
                            Clear this list
                        </button>
                    </>
                )}
            </section>

            <section className="bg-white border border-slate-300 rounded-lg p-5">
                <div className="flex items-start gap-3">
                    <DocumentTextIcon className="h-6 w-6 text-ink-800 shrink-0 mt-0.5" />
                    <div>
                        <h2 className="text-lg font-bold">Privacy notice</h2>
                        <p className="text-sm text-slate-600">
                            Exactly what this store keeps about you, in plain terms.
                        </p>
                    </div>
                </div>

                <dl className="mt-4 divide-y divide-slate-200">
                    {storedData.map((entry) => (
                        <div key={entry.title} className="py-3">
                            <dt className="font-medium">{entry.title}</dt>
                            <dd className="text-sm text-slate-600 mt-0.5">{entry.body}</dd>
                        </div>
                    ))}
                </dl>

                <p className="text-xs text-slate-500 mt-2">
                    Nothing here is sold or shared with advertisers. Your shopping preferences,
                    including the advertising switches, are stored in your browser and never leave
                    it.
                </p>
            </section>

            <section className="bg-white border border-red-300 rounded-lg p-5">
                <h2 className="text-lg font-bold text-red-700">Close your Markaz account</h2>
                <p className="text-sm text-slate-600 mt-1">
                    Closing removes your account details, saved addresses, lists, browsing history
                    and cart. Past orders are kept as financial records and are not deleted.
                </p>

                <button
                    type="button"
                    onClick={() => setCloseStep(1)}
                    className="mt-4 px-6 py-2 text-sm rounded-full border border-red-400 text-red-700 hover:bg-red-50 cursor-pointer"
                >
                    Close your Markaz account
                </button>
            </section>

            {closeStep > 0 && (
                <div
                    className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="close-account-title"
                >
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-5">
                        <h3 id="close-account-title" className="text-lg font-bold">
                            {closeStep === 1
                                ? "Before you close your account"
                                : "Confirm you want to close this account"}
                        </h3>

                        {closeStep === 1 && (
                            <>
                                <ul className="list-disc pl-5 mt-3 text-sm text-slate-700 space-y-1">
                                    <li>Your account details and sign-in are deleted permanently.</li>
                                    <li>Saved addresses, lists, saved items and browsing history go with them.</li>
                                    <li>Your cart is emptied and deleted.</li>
                                    <li>
                                        Past orders are kept. They stay linked to the account id that
                                        placed them so invoices and returns remain accurate.
                                    </li>
                                    <li>This cannot be undone, and the email can be reused later.</li>
                                </ul>

                                <label className="flex items-start gap-2 mt-4 text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={understood}
                                        onChange={(e) => setUnderstood(e.target.checked)}
                                        className="mt-1"
                                    />
                                    <span>
                                        I understand my account and its data will be permanently
                                        deleted.
                                    </span>
                                </label>

                                <div className="flex justify-end gap-3 mt-5">
                                    <button
                                        type="button"
                                        onClick={dismissDialog}
                                        className="px-5 py-2 text-sm rounded border border-slate-400 cursor-pointer"
                                    >
                                        Keep my account
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!understood}
                                        onClick={() => setCloseStep(2)}
                                        className="px-5 py-2 text-sm rounded bg-red-600 text-white cursor-pointer disabled:opacity-50 disabled:cursor-default"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </>
                        )}

                        {closeStep === 2 && (
                            <>
                                <p className="text-sm text-slate-700 mt-3">
                                    Type <span className="font-semibold">{email}</span> below to
                                    confirm. Nothing is deleted until you do.
                                </p>

                                <label htmlFor="confirm-email" className="sr-only">
                                    Your email address
                                </label>
                                <input
                                    id="confirm-email"
                                    type="email"
                                    autoComplete="off"
                                    value={typedEmail}
                                    onChange={(e) => setTypedEmail(e.target.value)}
                                    placeholder="Your email address"
                                    className="w-full mt-3 text-sm p-2.5 rounded border border-slate-300 outline-none"
                                />

                                {closing.error && (
                                    <p className="text-sm text-red-600 mt-2">{closing.error}</p>
                                )}
                                {closing.done && (
                                    <p className="text-sm text-green-700 mt-2">{closing.done}</p>
                                )}

                                <div className="flex justify-end gap-3 mt-5">
                                    <button
                                        type="button"
                                        onClick={dismissDialog}
                                        className="px-5 py-2 text-sm rounded border border-slate-400 cursor-pointer"
                                    >
                                        Keep my account
                                    </button>
                                    <button
                                        type="button"
                                        disabled={
                                            closing.busy ||
                                            Boolean(closing.done) ||
                                            typedEmail.trim().toLowerCase() !==
                                                String(email || "").toLowerCase()
                                        }
                                        onClick={closeAccountHandler}
                                        className="px-5 py-2 text-sm rounded bg-red-600 text-white cursor-pointer disabled:opacity-50 disabled:cursor-default"
                                    >
                                        {closing.busy ? "Closing…" : "Close my account"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataClient;
