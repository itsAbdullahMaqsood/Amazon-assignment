import Link from "next/link";
import {
    ChartBarIcon,
    ChatBubbleLeftRightIcon,
    MegaphoneIcon,
    PhotoIcon,
    ShieldCheckIcon,
    TruckIcon,
} from "@heroicons/react/24/outline";

import { INDIVIDUAL_PER_ITEM, PROFESSIONAL_MONTHLY, money } from "@/lib/sellerFees";

export const faqs = [
    {
        title: "How much does it cost to sell on Amazon?",
        content: `The Professional plan is ${money(PROFESSIONAL_MONTHLY)} a month whatever you sell. The Individual plan has no monthly charge but costs ${money(INDIVIDUAL_PER_ITEM)} for every item sold. Both plans also pay a referral fee on each sale, which is a percentage of the item price set by category.`,
    },
    {
        title: "Which plan should I start on?",
        content:
            "Sell fewer than about 40 items a month and the Individual plan is cheaper. Above that the monthly subscription wins, and it is the only plan with bulk listing tools, advertising and the Buy Box.",
    },
    {
        title: "What is a referral fee?",
        content:
            "A commission Amazon takes on each sale, worked out as a percentage of the total price. Most categories are 15%; electronics are closer to 8% and device accessories are far higher. The calculator above shows the rate for the category you pick.",
    },
    {
        title: "Do I need a business to register?",
        content:
            "No. Individuals can register with a bank account, a chargeable card, a government ID and tax information. You will need the same details either way.",
    },
    {
        title: "Who handles shipping?",
        content:
            "Your choice. Fulfilment by Amazon stores and ships for you and makes items Prime-eligible for an extra fee, or you pack and post orders yourself.",
    },
    {
        title: "When do I get paid?",
        content:
            "Sales settle into your seller balance and are disbursed to your bank account on a regular cycle, minus the fees shown in the calculator above.",
    },
];

export const SellHero = () => (
    <section className="bg-amazon-blue_dark text-white">
        <div className="max-w-[1500px] mx-auto px-4 py-10 md:py-16 grid gap-8 lg:grid-cols-[1.1fr_1fr] items-center">
            <div>
                <p className="text-amazon-orange font-semibold tracking-wide text-sm">
                    SELLING ON AMAZON
                </p>
                <h1 className="text-3xl md:text-5xl font-bold mt-2 leading-tight">
                    Start a selling account for {money(PROFESSIONAL_MONTHLY)}/month + selling fees
                </h1>
                <p className="mt-4 text-white/85 md:text-lg max-w-xl">
                    Put your products in front of shoppers already looking for them. Cancel the
                    subscription any month, or start on the Individual plan and pay{" "}
                    {money(INDIVIDUAL_PER_ITEM)} per item sold instead.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                        href="/auth/register?seller=1"
                        className="px-8 py-2.5 rounded-full bg-linear-to-r from-amazon-orange to-yellow-300 text-amazon-blue_dark font-medium"
                    >
                        Sign up
                    </Link>
                    <a
                        href="#fee-calculator"
                        className="px-8 py-2.5 rounded-full border border-white/50 font-medium hover:bg-white/10"
                    >
                        Estimate your fees
                    </a>
                </div>
            </div>

            {/* Drawn rather than sourced so no Amazon artwork is reproduced. */}
            <div className="hidden lg:block" aria-hidden="true">
                <svg viewBox="0 0 440 280" className="w-full h-auto" role="presentation">
                    <rect x="30" y="30" width="380" height="220" rx="12" fill="#232f3e" />
                    <rect x="54" y="58" width="150" height="12" rx="4" fill="#febd69" />
                    <rect x="54" y="84" width="96" height="8" rx="4" fill="#5a6b7d" />
                    <rect x="54" y="110" width="150" height="120" rx="8" fill="#131921" />
                    <polyline
                        points="70,208 104,180 138,190 172,146 190,158"
                        fill="none"
                        stroke="#febd69"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <rect x="228" y="58" width="158" height="82" rx="8" fill="#131921" />
                    <rect x="244" y="74" width="48" height="48" rx="6" fill="#37475a" />
                    <rect x="302" y="78" width="70" height="9" rx="4" fill="#5a6b7d" />
                    <rect x="302" y="96" width="52" height="9" rx="4" fill="#3d4a59" />
                    <rect x="302" y="114" width="36" height="9" rx="4" fill="#febd69" />
                    <rect x="228" y="152" width="158" height="78" rx="8" fill="#131921" />
                    <rect x="244" y="168" width="48" height="48" rx="6" fill="#37475a" />
                    <rect x="302" y="172" width="70" height="9" rx="4" fill="#5a6b7d" />
                    <rect x="302" y="190" width="52" height="9" rx="4" fill="#3d4a59" />
                    <rect x="302" y="208" width="36" height="9" rx="4" fill="#febd69" />
                </svg>
            </div>
        </div>
    </section>
);

const planRows = [
    {
        feature: "Cost",
        individual: `${money(INDIVIDUAL_PER_ITEM)} per item sold`,
        professional: `${money(PROFESSIONAL_MONTHLY)} per month, any volume`,
    },
    { feature: "Referral fees", individual: "Yes, by category", professional: "Yes, by category" },
    { feature: "Best for", individual: "Under 40 items a month", professional: "40 items a month or more" },
    { feature: "Bulk listing and feeds", individual: "—", professional: "Included" },
    { feature: "Eligible for the featured offer", individual: "—", professional: "Yes" },
    { feature: "Sponsored Products advertising", individual: "—", professional: "Yes" },
    { feature: "Promotions, coupons and deals", individual: "—", professional: "Yes" },
    { feature: "Restricted categories", individual: "—", professional: "Can apply" },
    { feature: "Order reports and analytics", individual: "Basic", professional: "Full reporting suite" },
    { feature: "Additional users", individual: "—", professional: "Yes, with permissions" },
];

export const Plans = () => (
    <section className="bg-white border-b border-slate-200">
        <div className="max-w-[1500px] mx-auto px-4 py-10">
            <h2 className="text-2xl md:text-3xl font-bold">Choose a selling plan</h2>
            <p className="text-slate-600 mt-2">
                You can switch between plans at any time from Seller Central.
            </p>

            <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm border border-slate-300 rounded-lg overflow-hidden">
                    <caption className="sr-only">
                        Individual and Professional selling plans compared
                    </caption>
                    <thead className="bg-amazon-blue_light text-white text-left">
                        <tr>
                            <th scope="col" className="p-3 font-semibold w-1/3">
                                Feature
                            </th>
                            <th scope="col" className="p-3 font-semibold">
                                Individual
                            </th>
                            <th scope="col" className="p-3 font-semibold">
                                Professional
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {planRows.map((row) => (
                            <tr key={row.feature} className="border-t border-slate-200 even:bg-slate-50">
                                <th scope="row" className="p-3 text-left font-medium">
                                    {row.feature}
                                </th>
                                <td className="p-3 text-slate-600">{row.individual}</td>
                                <td className="p-3 font-medium">{row.professional}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </section>
);

const steps = [
    {
        number: "1",
        title: "Create your seller account",
        body: "Register with your email, business or personal details, a bank account and tax information.",
    },
    {
        number: "2",
        title: "List your products",
        body: "Match to an existing listing or create a new one with photos, a title, bullet points and a price.",
    },
    {
        number: "3",
        title: "Choose how orders ship",
        body: "Send stock to Amazon for Prime-eligible fulfilment, or pack and post each order yourself.",
    },
    {
        number: "4",
        title: "Get paid and grow",
        body: "Sales settle to your balance, fees come out, and reports show which listings are worth pushing.",
    },
];

export const Steps = () => (
    <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-[1500px] mx-auto px-4 py-10">
            <h2 className="text-2xl md:text-3xl font-bold">How to start selling in 4 steps</h2>

            <ol className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {steps.map((step) => (
                    <li key={step.number} className="bg-white border border-slate-300 rounded-lg p-5">
                        <span className="w-9 h-9 rounded-full bg-amazon-blue_light text-white flex items-center justify-center font-bold">
                            {step.number}
                        </span>
                        <h3 className="font-bold mt-3">{step.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{step.body}</p>
                    </li>
                ))}
            </ol>
        </div>
    </section>
);

const tools = [
    {
        Icon: PhotoIcon,
        title: "Listing tools",
        body: "Bulk uploads, variation families and image guidelines that keep your detail pages complete.",
    },
    {
        Icon: TruckIcon,
        title: "Fulfilment by Amazon",
        body: "Store stock in Amazon's network and let it pick, pack, ship and handle returns.",
    },
    {
        Icon: MegaphoneIcon,
        title: "Advertising",
        body: "Sponsored Products and coupons put a listing in front of shoppers already searching.",
    },
    {
        Icon: ChartBarIcon,
        title: "Business reports",
        body: "Sessions, conversion, buy box share and fee breakdowns for every ASIN you sell.",
    },
    {
        Icon: ShieldCheckIcon,
        title: "Brand protection",
        body: "Register your brand to control your listings and report counterfeits quickly.",
    },
    {
        Icon: ChatBubbleLeftRightIcon,
        title: "Seller support",
        body: "Case-based help, seller forums and account health guidance when something goes wrong.",
    },
];

export const Tools = () => (
    <section className="bg-white border-b border-slate-200">
        <div className="max-w-[1500px] mx-auto px-4 py-10">
            <h2 className="text-2xl md:text-3xl font-bold">Tools that come with the account</h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                    <div key={tool.title} className="border border-slate-300 rounded-lg p-5">
                        <tool.Icon className="h-8 w-8 text-amazon-blue_light" />
                        <h3 className="font-bold mt-3">{tool.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{tool.body}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);
