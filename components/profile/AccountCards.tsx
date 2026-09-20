import Link from "next/link";
import {
    ArchiveBoxIcon,
    BuildingOffice2Icon,
    CreditCardIcon,
    DevicePhoneMobileIcon,
    EnvelopeIcon,
    GiftIcon,
    HomeIcon,
    LifebuoyIcon,
    ListBulletIcon,
    ShieldCheckIcon,
    SparklesIcon,
    UsersIcon,
} from "@heroicons/react/24/outline";

import { accountCards } from "./accountLinks";

const icons: any = {
    ArchiveBoxIcon,
    ShieldCheckIcon,
    SparklesIcon,
    HomeIcon,
    BuildingOffice2Icon,
    GiftIcon,
    CreditCardIcon,
    UsersIcon,
    DevicePhoneMobileIcon,
    ListBulletIcon,
    LifebuoyIcon,
    EnvelopeIcon,
};

const AccountCards = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accountCards.map((card) => {
                const Icon = icons[card.icon];

                return (
                    <Link
                        key={card.title}
                        href={card.href}
                        className="flex items-start gap-4 bg-white border border-slate-300 rounded-lg p-5 hover:shadow-md transition"
                    >
                        <span className="shrink-0 w-16 h-16 rounded-full bg-[#d6eaed] flex items-center justify-center">
                            <Icon className="w-8 h-8 text-[#146eb4]" />
                        </span>

                        <span>
                            <span className="block text-lg font-bold leading-snug">{card.title}</span>
                            <span className="block text-sm text-slate-600 mt-1">{card.description}</span>
                        </span>
                    </Link>
                );
            })}
        </div>
    );
};

export default AccountCards;
