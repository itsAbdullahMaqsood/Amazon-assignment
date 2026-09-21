import {
    ChartBarIcon,
    CheckBadgeIcon,
    CreditCardIcon,
    ReceiptPercentIcon,
    TagIcon,
    UserGroupIcon,
} from "@heroicons/react/24/outline";

import { benefits, comparison, quotes, steps } from "@/lib/business";

const icons: any = {
    TagIcon,
    UserGroupIcon,
    CheckBadgeIcon,
    ChartBarIcon,
    ReceiptPercentIcon,
    CreditCardIcon,
};

export const HowItWorks = () => (
    <section className="bg-white border-b border-slate-200">
        <div className="max-w-[1500px] mx-auto px-4 py-10">
            <h2 className="text-2xl md:text-3xl font-bold">How it works</h2>

            <ol className="mt-6 grid gap-5 md:grid-cols-3">
                {steps.map((step) => (
                    <li
                        key={step.number}
                        className="border border-slate-300 rounded-lg p-5 flex gap-4"
                    >
                        <span className="shrink-0 w-9 h-9 rounded-full bg-amazon-blue_light text-white flex items-center justify-center font-bold">
                            {step.number}
                        </span>
                        <div>
                            <h3 className="font-bold">{step.title}</h3>
                            <p className="text-sm text-slate-600 mt-1">{step.body}</p>
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    </section>
);

export const Benefits = () => (
    <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-[1500px] mx-auto px-4 py-10">
            <h2 className="text-2xl md:text-3xl font-bold">What you get</h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {benefits.map((benefit) => {
                    const Icon = icons[benefit.icon];

                    return (
                        <div
                            key={benefit.title}
                            className="bg-white border border-slate-300 rounded-lg p-5"
                        >
                            <Icon className="h-8 w-8 text-amazon-blue_light" />
                            <h3 className="font-bold mt-3">{benefit.title}</h3>
                            <p className="text-sm text-slate-600 mt-1">{benefit.body}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    </section>
);

export const Comparison = () => (
    <section className="bg-white border-b border-slate-200">
        <div className="max-w-[1500px] mx-auto px-4 py-10">
            <h2 className="text-2xl md:text-3xl font-bold">Personal vs Business account</h2>

            <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm border border-slate-300 rounded-lg overflow-hidden">
                    <caption className="sr-only">
                        Feature comparison between a personal Amazon account and an Amazon Business
                        account
                    </caption>
                    <thead className="bg-amazon-blue_light text-white text-left">
                        <tr>
                            <th scope="col" className="p-3 font-semibold w-1/3">
                                Feature
                            </th>
                            <th scope="col" className="p-3 font-semibold">
                                Personal account
                            </th>
                            <th scope="col" className="p-3 font-semibold">
                                Business account
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {comparison.map((row) => (
                            <tr key={row.feature} className="border-t border-slate-200 even:bg-slate-50">
                                <th scope="row" className="p-3 text-left font-medium">
                                    {row.feature}
                                </th>
                                <td className="p-3 text-slate-600">{row.personal}</td>
                                <td className="p-3 font-medium">{row.business}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </section>
);

export const Quotes = () => (
    <section className="bg-amazon-blue_dark text-white">
        <div className="max-w-[1500px] mx-auto px-4 py-10">
            <h2 className="text-2xl md:text-3xl font-bold">Why businesses switch</h2>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
                {quotes.map((entry) => (
                    <figure
                        key={entry.name}
                        className="bg-amazon-blue_light rounded-lg p-5 flex flex-col"
                    >
                        <blockquote className="grow text-white/90">
                            &ldquo;{entry.quote}&rdquo;
                        </blockquote>
                        <figcaption className="mt-4 text-sm">
                            <span className="font-semibold">{entry.name}</span>
                            <span className="block text-white/70">{entry.role}</span>
                        </figcaption>
                    </figure>
                ))}
            </div>
        </div>
    </section>
);
