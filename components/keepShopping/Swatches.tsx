"use client";

import Link from "next/link";
import Image from "next/image";

// The colour rail. Variants past `visible` collapse into a "+N" link that hands
// the rest over to the product page.
const Swatches = ({ styles, active, onSelect, href, visible = 6, size = "w-7 h-7" }: any) => {
    if (!styles?.length) {
        return null;
    }

    const shown = styles.slice(0, visible);
    const hidden = styles.length - shown.length;

    return (
        <div className="flex items-center gap-2">
            {shown.map((entry: any) => (
                <button
                    key={entry.style}
                    type="button"
                    onClick={() => onSelect(entry.style)}
                    aria-label={`Colour option ${entry.style + 1}`}
                    aria-pressed={active === entry.style}
                    className={`${size} rounded-full overflow-hidden relative border cursor-pointer ${
                        active === entry.style
                            ? "border-slate-900 ring-1 ring-slate-900 ring-offset-2"
                            : "border-slate-300"
                    }`}
                    style={{ backgroundColor: entry.color || "#e5e7eb" }}
                >
                    {entry.colorImage && (
                        <Image
                            src={entry.colorImage}
                            alt=""
                            fill
                            sizes="32px"
                            className="object-cover"
                        />
                    )}
                </button>
            ))}

            {hidden > 0 && (
                <Link href={href} className="text-sm text-slate-700 underline hover:text-[#C7511F]">
                    +{hidden}
                </Link>
            )}
        </div>
    );
};

export default Swatches;
