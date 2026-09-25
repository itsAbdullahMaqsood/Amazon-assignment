"use client";

import { useState, useSyncExternalStore } from "react";
import { TrashIcon, UserPlusIcon } from "@heroicons/react/24/outline";

import {
    addMember,
    benefits,
    householdStore,
    removeMember,
    seats,
    setSharing,
} from "@/lib/household";
import { formatDate } from "@/lib/localStore";

const roleLabel: any = { adult: "Adult", teen: "Teen", child: "Child" };

const HouseholdClient = ({ owner }: any) => {
    const state: any = useSyncExternalStore(
        householdStore.subscribe,
        householdStore.getSnapshot,
        householdStore.getServerSnapshot
    );

    const [open, setOpen] = useState<string>("");
    const [form, setForm] = useState<any>({ name: "", email: "", age: "" });
    const [error, setError] = useState<string>("");

    const members = state.members || [];
    const membersFor = (role: string) => members.filter((member: any) => member.role === role);

    const submit = (role: string) => {
        if (!form.name.trim()) {
            setError("Enter a name.");
            return;
        }

        if (role !== "child" && !/^\S+@\S+\.\S+$/.test(form.email)) {
            setError("Enter the email address of the person you are inviting.");
            return;
        }

        addMember({
            role: role as any,
            name: form.name.trim(),
            email: role === "child" ? undefined : form.email.trim(),
            age: role === "child" ? Number(form.age) || undefined : undefined,
        });

        setForm({ name: "", email: "", age: "" });
        setError("");
        setOpen("");
    };

    return (
        <div className="space-y-6">
            <div className="bg-white border border-slate-300 rounded-lg p-5">
                <h2 className="font-bold text-lg">Your household</h2>
                <p className="text-sm text-slate-600 mt-1">
                    Share Plus benefits with one other adult, up to four teens and up to four
                    children. Everyone keeps their own login, their own recommendations and
                    their own watchlist.
                </p>

                <div className="flex items-center gap-3 mt-4 border border-slate-200 rounded-lg p-3">
                    <div className="w-10 h-10 rounded-full bg-ink-800 text-white flex items-center justify-center font-bold">
                        {(owner?.name || "?").slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-sm">{owner?.name}</p>
                        <p className="text-xs text-slate-500">{owner?.email} · Adult (you)</p>
                    </div>
                </div>
            </div>

            {seats.map((seat) => {
                const list = membersFor(seat.role);
                const full = list.length >= seat.limit;

                return (
                    <div key={seat.role} className="bg-white border border-slate-300 rounded-lg p-5">
                        <div className="flex items-baseline justify-between">
                            <h2 className="font-bold text-lg">{seat.title}</h2>
                            <span className="text-xs text-slate-500">
                                {list.length} of {seat.limit}
                            </span>
                        </div>

                        <p className="text-sm text-slate-600 mt-1">{seat.blurb}</p>

                        {list.length > 0 && (
                            <ul className="mt-4 divide-y divide-slate-200 border border-slate-200 rounded-lg">
                                {list.map((member: any) => (
                                    <li key={member.id} className="flex items-center gap-3 p-3">
                                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold">
                                            {member.name.slice(0, 1).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold truncate">
                                                {member.name}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">
                                                {member.email ||
                                                    (member.age ? `Age ${member.age}` : "")}
                                                {" · "}
                                                {roleLabel[member.role]} since{" "}
                                                {formatDate(member.joinedAt)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeMember(member.id)}
                                            className="ml-auto flex items-center gap-1 text-xs text-accent-ink hover:underline cursor-pointer"
                                        >
                                            <TrashIcon className="h-4" />
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {open === seat.role ? (
                            <div className="mt-4 border border-slate-200 rounded-lg p-4 space-y-3">
                                <label className="block text-sm">
                                    <span className="font-semibold">Name</span>
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="mt-1 w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-accent-deep"
                                    />
                                </label>

                                {seat.role === "child" ? (
                                    <label className="block text-sm">
                                        <span className="font-semibold">Age</span>
                                        <input
                                            type="number"
                                            min={1}
                                            max={17}
                                            value={form.age}
                                            onChange={(e) => setForm({ ...form, age: e.target.value })}
                                            className="mt-1 w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-accent-deep"
                                        />
                                    </label>
                                ) : (
                                    <label className="block text-sm">
                                        <span className="font-semibold">Email address</span>
                                        <input
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="mt-1 w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-accent-deep"
                                        />
                                    </label>
                                )}

                                {error && <p className="text-xs text-red-600">{error}</p>}

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => submit(seat.role)}
                                        className="px-5 py-2 rounded-full bg-accent text-ink-900 text-sm cursor-pointer"
                                    >
                                        {seat.role === "child" ? "Add profile" : "Send invitation"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setOpen("");
                                            setError("");
                                        }}
                                        className="px-5 py-2 rounded-full border border-slate-300 text-sm cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>

                                {seat.role !== "child" && (
                                    <p className="text-xs text-slate-500">
                                        Invitations are not emailed in this build — the member is
                                        added straight away.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <button
                                disabled={full}
                                onClick={() => {
                                    setOpen(seat.role);
                                    setError("");
                                }}
                                className="mt-4 flex items-center gap-2 text-sm text-accent-ink hover:underline disabled:text-slate-400 disabled:no-underline cursor-pointer disabled:cursor-default"
                            >
                                <UserPlusIcon className="h-4" />
                                {full ? `${seat.title} are full` : seat.cta}
                            </button>
                        )}
                    </div>
                );
            })}

            <div className="bg-white border border-slate-300 rounded-lg p-5">
                <h2 className="font-bold text-lg">Benefits you share</h2>

                <ul className="mt-3 divide-y divide-slate-200">
                    {benefits.map((benefit) => (
                        <li key={benefit.id} className="flex items-start gap-3 py-3">
                            <input
                                id={`share-${benefit.id}`}
                                type="checkbox"
                                checked={state.sharing?.[benefit.id] !== false}
                                onChange={(e) => setSharing(benefit.id, e.target.checked)}
                                className="mt-1 cursor-pointer"
                            />
                            <label htmlFor={`share-${benefit.id}`} className="cursor-pointer">
                                <span className="text-sm font-semibold">{benefit.label}</span>
                                <span className="block text-xs text-slate-500">
                                    {benefit.description}
                                </span>
                            </label>
                        </li>
                    ))}
                </ul>

                <p className="text-xs text-slate-500 mt-3">
                    Household members are kept in this browser only; nothing here changes the
                    orders, addresses or payment methods stored on your account.
                </p>
            </div>
        </div>
    );
};

export default HouseholdClient;
