"use client";

import Link from "next/link";
import { EllipsisHorizontalIcon, LockClosedIcon } from "@heroicons/react/24/outline";

import { privacyLabel } from "@/lib/lists";

const ListCard = ({ list, onDelete }: any) => {
    return (
        <article className="border border-slate-300 rounded-lg p-4 flex flex-col">
            <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold leading-tight">{list.name}</h3>

                <button
                    onClick={() => onDelete(list)}
                    aria-label={`Delete ${list.name}`}
                    title="Delete list"
                    className="p-1 rounded hover:bg-slate-100 cursor-pointer"
                >
                    <EllipsisHorizontalIcon className="w-5 h-5" />
                </button>
            </div>

            <p className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                <LockClosedIcon className="w-3.5 h-3.5" />
                {privacyLabel(list.privacy)}
            </p>

            <p className="text-sm text-slate-700 mt-3">
                {list.count} {list.count === 1 ? "item" : "items"}
            </p>

            <Link
                href="/browse"
                className="text-sm text-[#007185] hover:underline mt-auto pt-3"
            >
                Add items to this list ›
            </Link>
        </article>
    );
};

export default ListCard;
