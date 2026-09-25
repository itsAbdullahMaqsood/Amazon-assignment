import Link from "next/link";
import {
    BookOpenIcon,
    PhotoIcon,
    PlayCircleIcon,
    PuzzlePieceIcon,
    TagIcon,
    TruckIcon,
} from "@heroicons/react/24/outline";

import { benefits } from "@/lib/prime";

const icons: any = { BookOpenIcon, PhotoIcon, PlayCircleIcon, PuzzlePieceIcon, TagIcon, TruckIcon };

const BenefitTiles = () => {
    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((benefit) => {
                const Icon = icons[benefit.icon];

                const tile = (
                    <>
                        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-accent-soft text-accent-ink">
                            <Icon className="w-7 h-7" />
                        </span>
                        <h3 className="mt-4 text-lg font-bold">{benefit.title}</h3>
                        <p className="mt-2 text-sm text-slate-600">{benefit.copy}</p>
                        {benefit.href && (
                            <span className="mt-3 inline-block text-sm text-accent-ink group-hover:text-accent-deep group-hover:underline">
                                Take a look
                            </span>
                        )}
                    </>
                );

                return benefit.href ? (
                    <Link
                        key={benefit.title}
                        href={benefit.href}
                        className="group border border-slate-300 rounded-lg p-6 bg-white hover:shadow-md transition"
                    >
                        {tile}
                    </Link>
                ) : (
                    <div
                        key={benefit.title}
                        className="border border-slate-300 rounded-lg p-6 bg-white"
                    >
                        {tile}
                    </div>
                );
            })}
        </div>
    );
};

export default BenefitTiles;
