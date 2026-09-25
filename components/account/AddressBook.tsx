"use client";

import { useState } from "react";
import axios from "axios";
import { MapPinIcon, PlusIcon } from "@heroicons/react/24/outline";

import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Sheet from "@/components/ui/Sheet";
import { EmptyState, Notice } from "@/components/ui/Layout";
import { cn } from "@/components/ui/cn";
import AddressForm from "@/components/checkout/AddressForm";
import { addressLines } from "@/lib/address";

// The active address first: it is the one checkout will use, so it is the one
// the page opens on.
const ordered = (list: any[]) => [...list].sort((a, b) => Number(!!b.active) - Number(!!a.active));

const AddressBook = ({ addresses: initial }: any) => {
    const [addresses, setAddresses] = useState<any[]>(initial || []);
    const [editing, setEditing] = useState<any>(null);
    const [removing, setRemoving] = useState<any>(null);
    const [busy, setBusy] = useState("");
    const [error, setError] = useState("");

    const saved = (list: any[]) => {
        setAddresses(list);
        setEditing(null);
        setRemoving(null);
    };

    const call = async (run: () => Promise<any>, id: string) => {
        setError("");
        setBusy(id);

        try {
            saved((await run()).data.addresses);
        } catch (err: any) {
            setError(err.response?.data?.message || "That didn't work. Try again.");
        } finally {
            setBusy("");
        }
    };

    const makeDefault = (address: any) =>
        call(() => axios.put("/api/user/manageaddress", { id: address._id }), address._id);

    const remove = (address: any) =>
        call(() => axios.delete("/api/user/manageaddress", { data: { id: address._id } }), address._id);

    return (
        <>
            {error && <Notice tone="danger" className="mb-4">{error}</Notice>}

            {addresses.length === 0 ? (
                <EmptyState
                    icon={MapPinIcon}
                    title="No addresses yet"
                    description="Add one here, or at checkout when you place your first order."
                    action={<Button onClick={() => setEditing({})}>Add an address</Button>}
                />
            ) : (
                <ul className="grid gap-4 sm:grid-cols-2">
                    {ordered(addresses).map((address: any) => (
                        <li
                            key={address._id}
                            className={cn(
                                "flex flex-col rounded-card border bg-surface p-5",
                                address.active ? "border-accent-ink ring-1 ring-accent-ink" : "border-line"
                            )}
                        >
                            {address.active && (
                                <Badge tone="accent" className="mb-3 self-start">
                                    Used at checkout
                                </Badge>
                            )}

                            <address className="not-italic">
                                <span className="block font-medium text-fg">
                                    {address.firstName} {address.lastName}
                                </span>
                                <span className="mt-1 block text-sm text-fg-muted">
                                    {addressLines(address).map((line: string) => (
                                        <span key={line} className="block">
                                            {line}
                                        </span>
                                    ))}
                                    <span className="mt-1 block">{address.phoneNumber}</span>
                                </span>
                            </address>

                            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3 text-sm">
                                <button type="button" onClick={() => setEditing(address)} className="text-link">
                                    Edit
                                </button>
                                {!address.active && (
                                    <button
                                        type="button"
                                        onClick={() => makeDefault(address)}
                                        disabled={busy === address._id}
                                        className="text-link disabled:opacity-50"
                                    >
                                        Use at checkout
                                    </button>
                                )}
                                <button type="button" onClick={() => setRemoving(address)} className="text-link">
                                    Remove
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {addresses.length > 0 && (
                <Button variant="outline" className="mt-5" onClick={() => setEditing({})}>
                    <PlusIcon className="h-5 w-5" />
                    Add an address
                </Button>
            )}

            <Sheet
                open={!!editing}
                onClose={() => setEditing(null)}
                title={editing?._id ? "Edit address" : "Add an address"}
                description={editing?._id ? undefined : "It becomes the address checkout uses."}
                side="right"
            >
                {editing && (
                    <AddressForm
                        address={editing._id ? editing : undefined}
                        submitLabel={editing._id ? "Save changes" : "Save and use this address"}
                        onSaved={saved}
                        onCancel={() => setEditing(null)}
                    />
                )}
            </Sheet>

            <Sheet
                open={!!removing}
                onClose={() => setRemoving(null)}
                side="center"
                title="Remove this address?"
                description={removing ? `${removing.firstName} ${removing.lastName}, ${removing.address1}` : undefined}
                footer={
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setRemoving(null)}>
                            Keep it
                        </Button>
                        <Button variant="danger" loading={busy === removing?._id} onClick={() => remove(removing)}>
                            Remove
                        </Button>
                    </div>
                }
            >
                <p className="text-sm text-fg-muted">
                    Orders already placed keep the address they were sent to. Only this saved copy goes.
                </p>
            </Sheet>
        </>
    );
};

export default AddressBook;
