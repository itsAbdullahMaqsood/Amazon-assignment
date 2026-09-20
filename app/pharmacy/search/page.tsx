import Link from "next/link";

import connectDb from "@/lib/db";
import Medication from "@/models/Medication";
import Header from "@/components/Header/Header";
import MenuSideBar from "@/components/Header/MenuSidebar";
import PharmacyNav from "@/components/pharmacy/PharmacyNav";
import MedicationSearch from "@/components/pharmacy/MedicationSearch";
import { PharmacyFooter } from "@/components/pharmacy/sections";
import Price from "@/components/shared/Price";
import { escapeRegex } from "@/utils/regex";

export const metadata = {
    title: "Medication search",
};

const Page = async ({ searchParams }: any) => {
    const query = await searchParams;
    const q = String(query?.q || "").trim();

    await connectDb();

    let medications: any[] = [];

    if (q.length > 1) {
        const pattern = { $regex: escapeRegex(q), $options: "i" };

        medications = await Medication.find({
            $or: [{ brandName: pattern }, { genericName: pattern }, { substance: pattern }],
        })
            .limit(24)
            .lean();
    }

    return (
        <>
            <Header title="Medication search" />

            <main className="bg-white min-h-screen">
                <PharmacyNav />

                <section className="bg-[#eef6f1] py-10">
                    <div className="max-w-[1400px] mx-auto px-6">
                        <MedicationSearch defaultValue={q} />
                    </div>
                </section>

                <div className="max-w-[1100px] mx-auto px-6 py-10">
                    <h1 className="text-2xl font-bold">
                        {medications.length} result{medications.length === 1 ? "" : "s"}
                        {q && (
                            <>
                                {" for "}
                                <span className="text-[#007a72]">&quot;{q}&quot;</span>
                            </>
                        )}
                    </h1>

                    {medications.length === 0 ? (
                        <div className="border border-slate-200 rounded-lg p-8 mt-6">
                            <p className="font-semibold">We couldn&apos;t find that medication.</p>
                            <p className="text-sm text-slate-600 mt-2">
                                Try the generic name, or a different spelling. Prescription data comes from
                                the openFDA drug label database.
                            </p>
                            <Link href="/pharmacy" className="inline-block mt-4 text-[#007a72] hover:underline">
                                Back to Amazon Pharmacy ›
                            </Link>
                        </div>
                    ) : (
                        <ul className="mt-6 space-y-4">
                            {medications.map((medication: any) => (
                                <li
                                    key={medication._id}
                                    className="border border-slate-200 rounded-lg p-5 flex flex-wrap gap-6 items-start"
                                >
                                    <div className="flex-1 min-w-[260px]">
                                        <h2 className="text-lg font-bold">{medication.brandName}</h2>

                                        {medication.genericName && (
                                            <p className="text-sm text-slate-600">
                                                {medication.genericName}
                                                {medication.dosageForm ? ` · ${medication.dosageForm}` : ""}
                                                {medication.route ? ` · ${medication.route}` : ""}
                                            </p>
                                        )}

                                        {medication.purpose && (
                                            <p className="text-sm mt-2 text-slate-700">{medication.purpose}</p>
                                        )}

                                        {medication.manufacturer && (
                                            <p className="text-xs text-slate-500 mt-2">
                                                {medication.manufacturer}
                                            </p>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <p className="text-xs text-slate-500">Cash price</p>
                                        <Price value={medication.price} size="md" />

                                        <p className="text-xs text-slate-500 mt-2">Price with Prime</p>
                                        <Price value={medication.primePrice} size="sm" />

                                        {medication.rxPassEligible && (
                                            <p className="mt-2 text-xs font-semibold text-[#007a72]">
                                                Included with RxPass
                                            </p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    <p className="text-xs text-slate-500 mt-8">
                        Medication data from the openFDA drug label API. Prices shown are generated for this
                        demo and are not real pharmacy prices.
                    </p>
                </div>

                <PharmacyFooter />
            </main>

            <MenuSideBar />
        </>
    );
};

export default Page;
