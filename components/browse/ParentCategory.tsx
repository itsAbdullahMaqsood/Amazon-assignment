"use client";

import { useState } from "react";
import {
    ChevronRightIcon,
    EllipsisHorizontalIcon,
    MinusIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";

const ParentCategory = ({ category, subCategories, activeCategory, filter }: any) => {
    const [open, setOpen] = useState<boolean>(activeCategory === category._id);
    const children = subCategories.filter(
        (sub: any) => String(sub.parent?._id) === String(category._id)
    );
    const active = activeCategory === category._id;

    return (
        <div className="py-1">
            <div
                onClick={() => {
                    filter({ category: active ? "" : category._id });
                    setOpen(true);
                }}
                className="flex items-center gap-1 text-sm cursor-pointer"
            >
                {active ? (
                    <ChevronRightIcon className="w-4 h-4 text-red-500" />
                ) : (
                    <EllipsisHorizontalIcon className="w-4 h-4" />
                )}

                <span className={active ? "text-red-500" : "hover:font-semibold"}>
                    {category.name}
                </span>

                {children.length > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpen(!open);
                        }}
                        aria-label={`${open ? "Collapse" : "Expand"} ${category.name}`}
                        className="ml-auto cursor-pointer"
                    >
                        {open ? <MinusIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
                    </button>
                )}
            </div>

            {open &&
                children.map((sub: any) => (
                    <div
                        key={sub._id}
                        className="ml-5 flex items-center gap-1 text-sm cursor-pointer hover:font-semibold hover:text-yellow-500"
                    >
                        <EllipsisHorizontalIcon className="w-4 h-4" />
                        {sub.name}
                    </div>
                ))}
        </div>
    );
};

export default ParentCategory;
