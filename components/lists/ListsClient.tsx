"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";

import { benefits } from "@/lib/lists";
import { BenefitArt, HeroArt } from "./art";
import CreateListModal from "./CreateListModal";
import ListCard from "./ListCard";

const tabs = ["Your Lists", "Your Friends"];

const ListsClient = ({ initialLists, children, startCreating = false }: any) => {
    const { data: session }: any = useSession();
    const router = useRouter();
    const [tab, setTab] = useState<string>(tabs[0]);
    const [lists, setLists] = useState<any[]>(initialLists || []);
    const [creating, setCreating] = useState<boolean>(startCreating && !!session);
    const [error, setError] = useState<string>("");

    // Signing in is what the real page does before it will create anything, and
    // it comes back here rather than to the account page.
    const createHandler = () => {
        if (!session) {
            router.push("/auth/signin?callbackUrl=/lists/create");
            return;
        }

        setCreating(true);
    };

    const deleteHandler = async (list: any) => {
        try {
            const { data } = await axios.delete("/api/user/lists", {
                data: { list_id: list._id },
            });
            setLists(data.lists);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        }
    };

    return (
        <>
            <div className="max-w-[1500px] mx-auto px-4">
                <div role="tablist" aria-label="Lists" className="flex items-end gap-8">
                    {tabs.map((entry) => (
                        <button
                            key={entry}
                            role="tab"
                            aria-selected={tab === entry}
                            onClick={() => setTab(entry)}
                            className={`text-2xl md:text-3xl pb-2 border-b-4 cursor-pointer ${
                                tab === entry
                                    ? "font-bold text-[#007185] border-[#007185]"
                                    : "text-slate-800 border-transparent hover:text-[#007185]"
                            }`}
                        >
                            {entry}
                        </button>
                    ))}
                </div>
            </div>

            {tab === "Your Lists" ? (
                <div className="max-w-[1500px] mx-auto px-4">
                    <div className="border border-slate-200 border-t-0">
                        <HeroArt />

                        <section className="px-4 py-10">
                            <h2 className="text-3xl text-center">Lists</h2>

                            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-8">
                                {benefits.map((benefit) => (
                                    <div key={benefit.title} className="flex items-start gap-4">
                                        <BenefitArt art={benefit.art} />

                                        <div>
                                            <h3 className="font-bold">{benefit.title}</h3>
                                            <p className="text-sm text-slate-700 mt-1">
                                                {benefit.body}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={createHandler}
                                    className="bg-[#ffd814] hover:bg-[#f7ca00] border border-[#fcd200] rounded-full px-8 py-2.5 text-sm font-medium cursor-pointer"
                                >
                                    Create a List
                                </button>
                            </div>

                            {error && (
                                <p role="alert" className="text-sm text-[#C40000] text-center mt-4">
                                    {error}
                                </p>
                            )}

                            {session && (
                                <div className="max-w-4xl mx-auto mt-10">
                                    <h3 className="text-lg font-bold">Your lists</h3>

                                    {lists.length ? (
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                            {lists.map((list: any) => (
                                                <ListCard
                                                    key={list._id}
                                                    list={list}
                                                    onDelete={deleteHandler}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-700 mt-2">
                                            You have no lists yet. Create one above, or save an item
                                            from any product page to{" "}
                                            <Link
                                                href="/profile/wishlist"
                                                className="text-[#007185] hover:underline"
                                            >
                                                your default list
                                            </Link>
                                            .
                                        </p>
                                    )}
                                </div>
                            )}
                        </section>

                        {children}
                    </div>
                </div>
            ) : (
                <div className="max-w-[1500px] mx-auto px-4">
                    <div className="border border-slate-200 border-t-0 px-4 py-16 text-center">
                        <h2 className="text-2xl font-bold">You have no friends&apos; lists</h2>

                        <p className="text-sm text-slate-700 mt-2">
                            Lists your friends share with you show up here. You can also look one up
                            by the name or email address on it.
                        </p>

                        <Link
                            href="/registry/find"
                            className="inline-block mt-6 text-sm text-[#007185] hover:underline"
                        >
                            Find a list or registry ›
                        </Link>
                    </div>
                </div>
            )}

            {creating && (
                <CreateListModal
                    existing={lists.map((list: any) => list.name)}
                    onClose={() => setCreating(false)}
                    onCreated={(next: any[]) => setLists(next)}
                />
            )}
        </>
    );
};

export default ListsClient;
