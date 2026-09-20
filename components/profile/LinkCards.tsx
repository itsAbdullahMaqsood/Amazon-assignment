import Link from "next/link";

import { accountLinkCards } from "./accountLinks";

const LinkCards = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {accountLinkCards.map((card) => (
                <div key={card.heading} className="bg-white border border-slate-300 rounded-lg p-5">
                    <h2 className="text-lg font-bold mb-3">{card.heading}</h2>

                    <ul className="space-y-2 text-sm">
                        {card.links.map((item: any) => (
                            <li key={item.label}>
                                <Link href={item.href} className="text-[#0F5FA6] hover:underline">
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default LinkCards;
