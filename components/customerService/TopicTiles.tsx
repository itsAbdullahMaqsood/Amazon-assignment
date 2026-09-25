import Link from "next/link";
import {
    ArrowUturnLeftIcon,
    CreditCardIcon,
    DevicePhoneMobileIcon,
    LockClosedIcon,
    ShoppingBagIcon,
    SparklesIcon,
    TruckIcon,
    UserCircleIcon,
} from "@heroicons/react/24/outline";

const icons: any = {
    orders: ShoppingBagIcon,
    returns: ArrowUturnLeftIcon,
    shipping: TruckIcon,
    account: UserCircleIcon,
    payments: CreditCardIcon,
    devices: DevicePhoneMobileIcon,
    prime: SparklesIcon,
    security: LockClosedIcon,
};

const TopicTiles = ({ topics }: any) => {
    return (
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topics.map((topic: any) => {
                const Icon = icons[topic.icon] || ShoppingBagIcon;

                return (
                    <li key={topic.slug}>
                        <Link
                            href={`/customer-service/${topic.slug}`}
                            className="h-full flex flex-col items-center text-center gap-2 border border-slate-300 rounded-lg bg-white p-5 hover:shadow-md hover:border-slate-400 transition"
                        >
                            <Icon className="h-10 w-10 text-ink-800" />
                            <span className="font-bold text-sm">{topic.title}</span>
                            <span className="text-xs text-slate-600">{topic.blurb}</span>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
};

export default TopicTiles;
