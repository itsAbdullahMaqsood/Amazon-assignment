import Link from "next/link";
import {
    ArrowUturnLeftIcon,
    CreditCardIcon,
    FilmIcon,
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
    devices: FilmIcon,
    prime: SparklesIcon,
    security: LockClosedIcon,
};

const TopicTiles = ({ topics }: any) => (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {topics.map((topic: any) => {
            const Icon = icons[topic.icon] || ShoppingBagIcon;

            return (
                <li key={topic.slug}>
                    <Link
                        href={`/customer-service/${topic.slug}`}
                        className="flex h-full flex-col rounded-card border border-line bg-surface p-4 hover:border-line-strong"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
                            <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="mt-3 block text-sm font-medium text-fg">{topic.title}</span>
                        <span className="mt-0.5 block text-sm text-fg-muted">{topic.blurb}</span>
                    </Link>
                </li>
            );
        })}
    </ul>
);

export default TopicTiles;
