"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CheckBadgeIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { useAppDispatch } from "@/redux/hooks";
import { showDialog } from "@/redux/slices/DialogSlice";
import { Badge, EmptyState, btn, field, table } from "@/components/admin/ui";
import { adminRequest, formatDate } from "@/components/admin/catalog/api";

const roleLabel: any = { user: "User", admin: "Admin" };

// Search and role filter live in the URL so a filtered list can be bookmarked,
// and the server does the matching (escaped) against the whole collection.
const UsersTable = ({ initial, total, page, pages, q, role, meId }: any) => {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();

    // Role changes patch one row locally until the refreshed server list arrives.
    const [patched, setPatched] = useState<any>(null);
    const users = patched && patched.from === initial ? patched.list : initial;

    const [pending, setPending] = useState<any>(null); // { id, role } awaiting confirmation
    const [busy, setBusy] = useState<string>("");
    const [status, setStatus] = useState<string>("");

    const hrefFor = (params: any) => {
        const next = new URLSearchParams();
        const merged = { q, role, page: 1, ...params };

        if (merged.q) next.set("q", merged.q);
        if (merged.role) next.set("role", merged.role);
        if (merged.page > 1) next.set("page", String(merged.page));

        const query = next.toString();
        return query ? `${pathname}?${query}` : pathname;
    };

    const search = (e: any) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        router.push(hrefFor({ q: String(form.get("q") || "").trim() }));
    };

    const confirmRole = async () => {
        if (!pending) return;

        setBusy(pending.id);
        const { data, error } = await adminRequest("put", "/api/admin/user", { id: pending.id, role: pending.role });
        setBusy("");
        setPending(null);

        if (error) {
            dispatch(showDialog({ header: "Role not changed", msgs: [{ msg: error, type: "error" }] }));
            return;
        }

        setPatched({
            from: initial,
            list: users.map((user: any) => (user._id === data.user._id ? { ...user, ...data.user } : user)),
        });
        setStatus(data.message);
        router.refresh();
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <form onSubmit={search} role="search" className="flex flex-1 gap-2 min-w-0">
                    <label htmlFor="user-search" className="sr-only">
                        Search users by name or email
                    </label>
                    <div className="relative flex-1 min-w-0">
                        <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        {/* Keyed on q so the box resets when the URL changes (Back, Clear). */}
                        <input
                            key={q}
                            id="user-search"
                            name="q"
                            type="search"
                            defaultValue={q}
                            placeholder="Search name or email"
                            maxLength={100}
                            className={`${field} pl-9`}
                        />
                    </div>
                    <button type="submit" className={btn.secondary}>
                        Search
                    </button>
                </form>

                <div className="flex items-center gap-2">
                    <label htmlFor="role-filter" className="text-sm text-slate-700 whitespace-nowrap">
                        Role
                    </label>
                    <select
                        id="role-filter"
                        value={role}
                        onChange={(e) => router.push(hrefFor({ role: e.target.value }))}
                        className={`${field} w-36`}
                    >
                        <option value="">All roles</option>
                        <option value="user">Users</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-slate-600" aria-live="polite">
                    {status || `${total} ${total === 1 ? "user" : "users"}${q ? ` matching “${q}”` : ""}`}
                </p>
                {(q || role) && (
                    <Link
                        href={pathname}
                        className="inline-flex items-center gap-1 text-sm text-accent-ink hover:underline rounded outline-none focus-visible:ring-2 focus-visible:ring-accent-ink"
                    >
                        <XMarkIcon className="w-4 h-4" />
                        Clear filters
                    </Link>
                )}
            </div>

            <div className={table.wrap}>
                <table className={table.table}>
                    <thead className={table.head}>
                        <tr>
                            <th scope="col" className={table.th}>Name</th>
                            <th scope="col" className={table.th}>Email</th>
                            <th scope="col" className={table.th}>Role</th>
                            <th scope="col" className={table.th}>Verified</th>
                            <th scope="col" className={table.th}>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5}>
                                    <EmptyState title="No users found">Try a different search or role.</EmptyState>
                                </td>
                            </tr>
                        )}

                        {users.map((user: any) => {
                            const isMe = user._id === meId;
                            const asking = pending?.id === user._id;

                            return (
                                <tr key={user._id} className={table.row}>
                                    <th scope="row" className={`${table.td} font-normal`}>
                                        <div className="flex items-center gap-3 min-w-44">
                                            {user.image ? (
                                                <Image
                                                    src={user.image}
                                                    alt=""
                                                    width={32}
                                                    height={32}
                                                    unoptimized
                                                    className="w-8 h-8 rounded-full object-cover bg-slate-100 shrink-0"
                                                />
                                            ) : (
                                                <span
                                                    aria-hidden="true"
                                                    className="w-8 h-8 rounded-full bg-ink-800 text-white text-xs font-semibold flex items-center justify-center shrink-0"
                                                >
                                                    {String(user.name || "?").charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                            <span className="font-medium text-fg">
                                                {user.name}
                                                {isMe && <span className="text-slate-500 font-normal"> (you)</span>}
                                            </span>
                                        </div>
                                    </th>
                                    <td className={`${table.td} text-slate-700 break-all min-w-48`}>{user.email}</td>
                                    <td className={`${table.td} whitespace-nowrap`}>
                                        {isMe ? (
                                            <span title="You can't change your own role">
                                                <Badge tone="violet">{roleLabel[user.role] || user.role}</Badge>
                                            </span>
                                        ) : asking ? (
                                            <div className="inline-flex items-center gap-1" role="group" aria-label={`Confirm role change for ${user.name}`}>
                                                <span className="text-xs text-slate-700 mr-1">
                                                    Make {pending.role === "admin" ? "an admin" : "a user"}?
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={confirmRole}
                                                    disabled={busy === user._id}
                                                    className={`${btn.primary} h-9 px-3`}
                                                >
                                                    {busy === user._id ? "Saving…" : "Confirm"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setPending(null)}
                                                    className={`${btn.secondary} h-9 px-3`}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <label htmlFor={`role-${user._id}`} className="sr-only">
                                                    Role for {user.name}
                                                </label>
                                                <select
                                                    id={`role-${user._id}`}
                                                    value={user.role === "admin" ? "admin" : "user"}
                                                    onChange={(e) => setPending({ id: user._id, role: e.target.value })}
                                                    className={`${field} h-9 w-28 ${user.role === "admin" ? "font-semibold text-violet-700" : ""}`}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </>
                                        )}
                                    </td>
                                    <td className={`${table.td} whitespace-nowrap`}>
                                        {user.emailVerified ? (
                                            <Badge tone="green">
                                                <CheckBadgeIcon className="w-3.5 h-3.5 mr-1" />
                                                Verified
                                            </Badge>
                                        ) : (
                                            <Badge tone="amber">Unverified</Badge>
                                        )}
                                    </td>
                                    <td className={`${table.td} whitespace-nowrap text-slate-600`}>{formatDate(user.createdAt)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {pages > 1 && (
                <nav aria-label="Users pages" className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-600">
                        Page {page} of {pages}
                    </span>
                    <div className="flex gap-2">
                        {page > 1 ? (
                            <Link href={hrefFor({ page: page - 1 })} className={btn.secondary}>
                                Previous
                            </Link>
                        ) : (
                            <span className={`${btn.secondary} opacity-50 pointer-events-none`} aria-disabled="true">
                                Previous
                            </span>
                        )}
                        {page < pages ? (
                            <Link href={hrefFor({ page: page + 1 })} className={btn.secondary}>
                                Next
                            </Link>
                        ) : (
                            <span className={`${btn.secondary} opacity-50 pointer-events-none`} aria-disabled="true">
                                Next
                            </span>
                        )}
                    </div>
                </nav>
            )}
        </div>
    );
};

export default UsersTable;
