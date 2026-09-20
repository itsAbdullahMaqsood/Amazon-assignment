import Link from "next/link";

import { placeholder } from "@/components/profile/accountLinks";

// The blue Prime Big Deal Days rail. The parcel is drawn rather than sourced so
// no Amazon artwork is reproduced.
const PrimeBanner = () => {
    return (
        <section className="bg-[#1F6FEB] text-white overflow-hidden">
            <div className="max-w-[1500px] mx-auto px-4 py-8 md:py-10 flex items-center gap-6">
                <div className="grow">
                    <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                        Prime Big Deal Days is October 6-7
                    </h2>
                    <p className="text-lg md:text-2xl mt-2 text-white/90">
                        Members get early deals now
                    </p>
                </div>

                <div className="hidden lg:block shrink-0" aria-hidden="true">
                    <svg width="300" height="130" viewBox="0 0 300 130" role="presentation">
                        <polygon points="10,40 230,10 290,40 70,80" fill="#c8a06a" />
                        <polygon points="10,40 70,80 70,125 10,85" fill="#a8803f" />
                        <polygon points="70,80 290,40 290,88 70,125" fill="#d9b98a" />
                        <polygon points="26,44 240,14 258,24 44,54" fill="#1b2430" opacity="0.9" />
                        <polygon points="44,54 258,24 258,60 44,92" fill="#232f3e" />
                        <text x="60" y="78" fill="white" fontSize="16" fontStyle="italic">
                            prime
                        </text>
                        <text x="150" y="62" fill="white" fontSize="16" fontStyle="italic">
                            prime
                        </text>
                    </svg>
                </div>

                <div className="shrink-0 text-center">
                    <Link
                        href={placeholder("Join Prime")}
                        className="inline-block bg-[#FFD814] text-black font-medium rounded-full px-6 py-2 hover:bg-[#F7CA00]"
                    >
                        Join Prime
                    </Link>
                    <p className="text-xs mt-2 text-white/90">
                        Included with a
                        <br />
                        Prime membership
                    </p>
                </div>
            </div>
        </section>
    );
};

export default PrimeBanner;
