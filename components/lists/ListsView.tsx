"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ListBulletIcon, PlusIcon } from "@heroicons/react/24/outline";

import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Sheet from "@/components/ui/Sheet";
import { EmptyState, Notice } from "@/components/ui/Layout";
import { isShareable, listDate, privacyLabel } from "@/lib/lists";
import ListFormSheet from "./ListFormSheet";

const Thumbnails = ({ images }: any) => (
    <div className="grid grid-cols-4 gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="relative aspect-square overflow-hidden rounded-control bg-surface-muted">
                {images[i] && <Image src={images[i]} alt="" fill sizes="80px" className="object-contain p-1" />}
            </span>
        ))}
    </div>
);

const ListsView = ({ lists: initial, openNew = false }: any) => {
    const router = useRouter();
    const [lists, setLists] = useState<any[]>(initial || []);
    const [creating, setCreating] = useState(openNew);
    const [removing, setRemoving] = useState<any>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    // A new list is empty, so the page it lands on is where you put things in it.
    const created = (data: any) => {
        setCreating(false);
        router.push(`/lists/${data.id}`);
    };

    const remove = async () => {
        setError("");
        setBusy(true);

        try {
            const { data } = await axios.delete("/api/user/lists", { data: { list_id: removing._id } });
            setLists(data.lists.map((list: any) => ({ ...list, thumbnails: lists.find((entry) => entry._id === list._id)?.thumbnails || [] })));
            setRemoving(null);
        } catch (err: any) {
            setError(err.response?.data?.message || "That couldn't be deleted.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            {error && <Notice tone="danger" className="mb-4">{error}</Notice>}

            {lists.length === 0 ? (
                <EmptyState
                    icon={ListBulletIcon}
                    title="No lists yet"
                    description="A list is a named set of products — a kitchen to kit out, a birthday, things to think about. Keep it private, or share the link so people can see what you want."
                    action={<Button onClick={() => setCreating(true)}>Create a list</Button>}
                />
            ) : (
                <>
                    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {lists.map((list: any) => (
                            <li key={list._id} className="flex flex-col rounded-card border border-line bg-surface p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <Link href={`/lists/${list._id}`} className="font-display text-lg font-semibold text-fg hover:underline underline-offset-2">
                                        {list.name}
                                    </Link>
                                    <Badge tone={isShareable(list.privacy) ? "accent" : "neutral"}>{privacyLabel(list.privacy)}</Badge>
                                </div>

                                <p className="mt-0.5 text-sm text-fg-muted">
                                    {list.count} item{list.count === 1 ? "" : "s"}
                                    {list.bought > 0 && <> · {list.bought} bought</>}
                                    {list.createdAt && <> · made {listDate(list.createdAt)}</>}
                                </p>

                                <div className="mt-4">
                                    <Thumbnails images={list.thumbnails || []} />
                                </div>

                                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3 text-sm">
                                    <Link href={`/lists/${list._id}`} className="text-link">
                                        Open
                                    </Link>
                                    <button type="button" onClick={() => setRemoving(list)} className="text-link">
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <Button variant="outline" className="mt-5" onClick={() => setCreating(true)}>
                        <PlusIcon className="h-5 w-5" />
                        Create a list
                    </Button>
                </>
            )}

            <ListFormSheet open={creating} onClose={() => setCreating(false)} onSaved={created} />

            <Sheet
                open={!!removing}
                onClose={() => setRemoving(null)}
                side="center"
                title={`Delete “${removing?.name}”?`}
                footer={
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setRemoving(null)}>
                            Keep it
                        </Button>
                        <Button variant="danger" loading={busy} onClick={remove}>
                            Delete list
                        </Button>
                    </div>
                }
            >
                <p className="text-sm text-fg-muted">
                    The list and everything on it goes. The products themselves are untouched, and anyone holding
                    its link will no longer be able to open it.
                </p>
            </Sheet>
        </>
    );
};

export default ListsView;
