import Link from "next/link";
import { CheckCircleIcon, StarIcon } from "@heroicons/react/24/solid";
import {
    LockClosedIcon,
    PlayCircleIcon,
    UserIcon,
    DevicePhoneMobileIcon,
    ClipboardDocumentCheckIcon,
    TruckIcon,
} from "@heroicons/react/24/outline";

import { placeholder } from "@/components/profile/accountLinks";
import {
    CouponArt,
    DeliveryArt,
    InsuranceCardArt,
    PillPackArt,
    PrimeSavingsArt,
    RxPassArt,
} from "./art";
import { PharmacyWordmark } from "./PharmacyNav";

const orangeButton =
    "inline-block bg-accent hover:bg-accent text-black font-semibold px-6 py-3 rounded transition";

export const PromoBanner = () => (
    <div className="bg-accent-ink text-white">
        <div className="max-w-[1500px] mx-auto px-6 py-4 flex flex-wrap items-center justify-center gap-6 text-center">
            <p className="font-bold">
                Need treatment? Get connected to a One Medical provider for $0 with Plus
            </p>
            <Link href={placeholder("One Medical terms")} className="underline">
                Terms apply
            </Link>
        </div>
    </div>
);

export const Hero = () => (
    <section className="bg-success-soft">
        <div className="max-w-[1500px] mx-auto px-6 grid md:grid-cols-2 gap-8 items-center py-16">
            <div>
                <h1 className="text-5xl md:text-6xl font-extrabold text-ink-800 leading-[1.05]">
                    Save time, save money, stay healthy.
                </h1>

                <Link href="/auth/register" className={`${orangeButton} mt-8`}>
                    Sign up for Markaz Pharmacy
                </Link>

                <p className="mt-6">
                    <Link
                        href={placeholder("Check if we accept your insurance")}
                        className="text-success font-semibold hover:underline"
                    >
                        Check if we accept your insurance ›
                    </Link>
                </p>

                <p className="mt-6 flex items-center gap-2 text-sm">
                    <LockClosedIcon className="w-5 h-5" />
                    <Link href={placeholder("Health information privacy")} className="underline">
                        Your health information is always protected
                    </Link>
                </p>
            </div>

            <PillPackArt />
        </div>
    </section>
);

const benefits = [
    "Low prices, with or without insurance",
    "Automatic refills, delivered to your door",
    "Pharmacists on call 24/7",
];

export const BenefitsStrip = () => (
    <section className="bg-success-soft border-t border-white">
        <div className="max-w-[1500px] mx-auto px-6 py-6 flex flex-wrap items-center gap-x-16 gap-y-3">
            {benefits.map((benefit) => (
                <p key={benefit} className="flex items-center gap-2">
                    <CheckCircleIcon className="w-6 h-6 text-success" />
                    {benefit}
                </p>
            ))}

            <Link
                href={placeholder("All Markaz Pharmacy benefits")}
                className="ml-auto text-success font-semibold hover:underline"
            >
                See all benefits +
            </Link>
        </div>
    </section>
);

const savings = [
    {
        art: <PrimeSavingsArt />,
        title: "Plus savings",
        copy: "Save up to 80%* with exclusive discounts for Plus members.",
        cta: "Learn more about Plus savings ›",
    },
    {
        art: <RxPassArt />,
        title: "Rx Saver",
        copy: "Plus members, get as many eligible meds as you take for one $5-a-month subscription.**",
        cta: "Learn more about Rx Saver ›",
    },
    {
        art: <CouponArt />,
        title: "Coupons",
        copy: "We automatically apply eligible manufacturer coupons at checkout.",
        cta: "Learn more about coupons ›",
    },
];

export const SpendLess = () => (
    <section className="bg-accent-soft">
        <div className="max-w-[1400px] mx-auto px-6 py-16 text-center">
            <h2 className="text-4xl font-extrabold text-ink-800">More ways to spend less</h2>
            <p className="mt-3 text-lg">
                From coupons to Plus member savings, we work hard to find you low prices.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-10 text-left">
                {savings.map((card) => (
                    <article key={card.title} className="bg-white rounded-xl overflow-hidden">
                        {card.art}
                        <div className="p-6 text-center">
                            <h3 className="font-bold text-lg">{card.title}</h3>
                            <p className="mt-2 text-slate-700">{card.copy}</p>
                            <Link
                                href={placeholder(card.title)}
                                className="inline-block mt-4 text-success font-semibold hover:underline"
                            >
                                {card.cta}
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    </section>
);

export const InsuranceSection = () => (
    <section className="bg-accent-soft">
        <div className="max-w-[1400px] mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
            <InsuranceCardArt />

            <div>
                <h2 className="text-4xl font-extrabold text-ink-800">Most insurance plans accepted</h2>
                <p className="mt-4 text-lg">
                    We calculate your copay automatically, so you never have to wonder what&apos;s covered.
                </p>
                <Link
                    href={placeholder("Check if we accept your insurance")}
                    className={`${orangeButton} mt-8`}
                >
                    Check if we accept your insurance
                </Link>
            </div>
        </div>
    </section>
);

export const CaregiverSection = () => (
    <section className="bg-accent-soft">
        <div className="max-w-[1400px] mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-accent-soft rounded-xl h-[320px] flex items-end p-4">
                <span className="bg-fg text-white text-xs px-2 py-1 rounded">Caregiver</span>
            </div>

            <div>
                <span className="inline-block bg-success text-ink-800 text-xs font-bold px-3 py-1 rounded">
                    NEW
                </span>
                <h2 className="text-4xl font-extrabold text-ink-800 mt-4">
                    Get help with your medication
                </h2>
                <p className="mt-4 text-lg">
                    Let someone you trust manage your prescriptions, set up refills, and keep your health
                    information up to date.
                </p>

                <Link href={placeholder("Invite someone to help with your meds")} className={`${orangeButton} mt-8`}>
                    Invite someone to help with your meds
                </Link>

                <div className="flex items-start gap-3 mt-8">
                    <UserIcon className="w-8 h-8 text-success" />
                    <p>
                        <span className="font-bold block">Want to help another adult?</span>
                        Ask them to invite you from their Markaz Pharmacy settings.{" "}
                        <Link href={placeholder("Caregiver FAQs")} className="underline">
                            See FAQs
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    </section>
);

export const DeliverySection = () => (
    <section className="bg-warning-soft">
        <div className="max-w-[1400px] mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
            <div>
                <h2 className="text-4xl font-extrabold text-ink-800">Goodbye, pharmacy line</h2>
                <p className="mt-4 text-lg">
                    We deliver your medication right to your door, with status updates along the way.
                </p>

                <Link href="/auth/register" className={`${orangeButton} mt-8`}>
                    Sign up for Markaz Pharmacy
                </Link>

                <p className="mt-6">
                    <Link href={placeholder("Check if we accept your insurance")} className="underline">
                        Check if we accept your insurance ›
                    </Link>
                </p>
            </div>

            <DeliveryArt />
        </div>
    </section>
);

export const HereForYou = () => (
    <section className="bg-success-soft">
        <div className="max-w-[1400px] mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
            <div>
                <h2 className="text-4xl font-extrabold text-ink-800">We&apos;re here for you</h2>
                <p className="mt-4 text-lg">
                    Our U.S.-licensed pharmacists check every order before it goes out. Have a question for
                    them? Reach out anytime, day or night.
                </p>

                <div className="flex gap-4 mt-8">
                    <div className="bg-white rounded-lg px-5 py-4 text-center text-xs">
                        <p className="font-bold">URAC accredited</p>
                        <p className="text-slate-600 mt-1">Mail Service Pharmacy 01/01/2027</p>
                    </div>
                    <div className="bg-white rounded-lg px-5 py-4 text-center text-xs">
                        <p className="font-bold">NABP accredited</p>
                        <p className="text-slate-600 mt-1">Digital Pharmacy</p>
                    </div>
                </div>
            </div>

            <div className="h-[320px] rounded-full bg-success-soft" />
        </div>
    </section>
);

const steps = [
    {
        icon: DevicePhoneMobileIcon,
        title: "1. Sign up for Markaz Pharmacy",
        copy: "It's simple. And free, always.",
        link: { label: "Sign in or sign up", href: "/auth/signin?callbackUrl=/pharmacy" },
    },
    {
        icon: ClipboardDocumentCheckIcon,
        title: "2. We'll get your prescription",
        copy: "We can work with your insurance and current pharmacy to get your prescription.",
    },
    {
        icon: TruckIcon,
        title: "3. Get your meds delivered",
        copy: "Have a question? Our pharmacists are available 24/7.",
    },
];

export const HowItWorks = () => (
    <section className="bg-white">
        <div className="max-w-[1400px] mx-auto px-6 py-16 text-center">
            <h2 className="text-4xl font-extrabold text-ink-800">How it works</h2>

            <Link
                href={placeholder("Discover Markaz Pharmacy")}
                className="inline-flex items-center gap-2 mt-4 text-success font-semibold hover:underline"
            >
                <PlayCircleIcon className="w-7 h-7" />
                Discover Markaz Pharmacy (0:47)
            </Link>

            <div className="grid md:grid-cols-3 gap-10 mt-12">
                {steps.map((step) => (
                    <div key={step.title}>
                        <div className="w-40 h-40 mx-auto rounded-full bg-success-soft flex items-center justify-center">
                            <step.icon className="w-16 h-16 text-success" />
                        </div>
                        <h3 className="font-bold text-lg mt-6">{step.title}</h3>
                        <p className="mt-2 text-slate-700">{step.copy}</p>
                        {step.link && (
                            <Link href={step.link.href} className="underline">
                                {step.link.label}
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            <Link
                href={placeholder("How Markaz Pharmacy works")}
                className="inline-block mt-12 bg-success hover:bg-success text-white font-semibold px-8 py-3 rounded transition"
            >
                Learn more about how it works
            </Link>
        </div>
    </section>
);

const testimonials = [
    {
        quote: "Fewer trips to the pharmacy and more reliable service than I was getting with my old pharmacy",
        name: "Anita F",
    },
    {
        quote: "Ordering from Markaz is so simple. I don't have to wait in line, and when I order it shows up at the door.",
        name: "Louis D",
    },
    {
        quote: "I don't have to follow up with my doctor's office for refills anymore. Markaz Pharmacy handles everything.",
        name: "Meredith M",
    },
    {
        quote: "It is very easy to order my prescriptions and then receive them delivered to my home very quickly!",
        name: "Kathleen F",
    },
];

export const Testimonials = () => (
    <section className="bg-accent-soft">
        <div className="max-w-[1400px] mx-auto px-6 py-16 text-center">
            <h2 className="text-4xl font-extrabold text-ink-800">What customers are saying</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
                {testimonials.map((entry) => (
                    <figure key={entry.name} className="bg-white border border-slate-200 rounded-lg p-6">
                        <div className="flex justify-center gap-1">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <StarIcon key={i} className="w-5 h-5 text-success" />
                            ))}
                        </div>
                        <blockquote className="font-bold mt-4">“{entry.quote}”</blockquote>
                        <figcaption className="text-sm text-slate-600 mt-4">
                            – {entry.name}, Markaz Pharmacy customer
                        </figcaption>
                    </figure>
                ))}
            </div>
        </div>
    </section>
);

const explore = [
    {
        title: "One Medical Membership",
        copy: "Get on-demand medical care for $99/year with Plus, or book a visit at our 200+ offices.",
    },
    {
        title: "One Medical On-Demand Care (formerly Pay-Per-Visit)",
        copy: "No-commitment telehealth, as low as $29 per visit.",
    },
];

export const MoreToExplore = () => (
    <section className="bg-success-soft">
        <div className="max-w-[1200px] mx-auto px-6 py-16 text-center">
            <h2 className="text-4xl font-extrabold text-ink-800">More to explore</h2>
            <p className="mt-3 text-lg">Discover other ways Markaz can help you stay healthy.</p>

            <div className="grid md:grid-cols-2 gap-6 mt-10">
                {explore.map((card) => (
                    <article key={card.title} className="bg-white rounded-xl overflow-hidden">
                        <div className="h-[280px] bg-success-soft" />
                        <div className="p-6">
                            <h3 className="font-bold">{card.title}</h3>
                            <p className="mt-2 text-slate-700">{card.copy}</p>
                            <Link
                                href={placeholder(card.title)}
                                className="inline-block mt-4 text-success font-semibold hover:underline"
                            >
                                Learn more ›
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    </section>
);

export const CtaBand = () => (
    <section className="bg-success text-white">
        <div className="max-w-[1400px] mx-auto px-6 py-16 text-center">
            <h2 className="text-4xl font-extrabold">Your medication, delivered.</h2>

            <Link href="/auth/register" className={`${orangeButton} mt-8`}>
                Sign up for Markaz Pharmacy
            </Link>

            <p className="mt-6">
                <Link href={placeholder("Check if we accept your insurance")} className="underline">
                    Check if we accept your insurance ›
                </Link>
            </p>
        </div>
    </section>
);

export const PharmacyFooter = () => (
    <footer className="bg-white">
        <div className="max-w-[1400px] mx-auto px-6 py-10">
            <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                    <PharmacyWordmark />
                    <ul className="flex flex-wrap items-center gap-6 mt-5 text-success">
                        <li>
                            <Link href="/pharmacy" className="hover:underline">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href={placeholder("How Markaz Pharmacy works")} className="hover:underline">
                                How it works
                            </Link>
                        </li>
                        <li>
                            <Link href={placeholder("Ways to save")} className="hover:underline">
                                Ways to save
                            </Link>
                        </li>
                        <li>
                            <Link href={placeholder("Markaz Pharmacy help")} className="hover:underline">
                                Help
                            </Link>
                        </li>
                    </ul>
                </div>

                <div className="flex gap-4 text-xs">
                    <div className="border border-slate-200 rounded-lg px-4 py-3 text-center">
                        <p className="font-bold">URAC accredited</p>
                        <p className="text-slate-600">Mail Service Pharmacy 01/01/2027</p>
                    </div>
                    <div className="border border-slate-200 rounded-lg px-4 py-3 text-center">
                        <p className="font-bold">NABP accredited</p>
                        <p className="text-slate-600">Digital Pharmacy</p>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-200 mt-8 pt-6 flex flex-wrap items-center gap-8 text-sm">
                <p>Markaz Pharmacy Home Delivery 4500 S Pleasant Valley Road, Suite 201 Austin, TX 78744-2911</p>
                <Link href={placeholder("Markaz Pharmacy help")} className="text-success hover:underline">
                    Help
                </Link>
                <p>Fax: 512.884.5981</p>
                <Link href={placeholder("Markaz Pharmacy for prescribers")} className="text-success hover:underline">
                    Markaz Pharmacy for prescribers ›
                </Link>
            </div>

            <div className="mt-6 space-y-4 text-xs text-slate-600">
                <p>Names depicted in photography are for illustrative purposes.</p>
                <p>
                    <span className="font-bold">
                        *The Amazon Prime prescription savings benefit and INSIDE RX ARE NOT INSURANCE.
                    </span>{" "}
                    Cannot be used with any insurance benefit, copay assistance programs, or by persons
                    covered by state-funded or federal-funded programs such as Medicare, Medicaid, or
                    Tricare for purchases of certain medications, even if processed outside the benefit as
                    an uninsured (cash-paying) patient. Pricing shown online is subject to change in real
                    time. Age restrictions may apply to the purchase of certain drugs.
                </p>
                <p>
                    <span className="font-bold">**RXPASS IS NOT INSURANCE.</span> Only certain medications
                    are eligible for purchase under the program. Other limitations apply, see the full
                    terms at Rx Saver Terms of Use or visit our Help Center. You agree to Markaz
                    Pharmacy&apos;s Notice of Privacy Practices.
                </p>
            </div>
        </div>
    </footer>
);
