import Link from "next/link";

import { placeholder } from "@/components/profile/accountLinks";
import { registries } from "@/lib/lists";
import { AlexaTile, RegistryArt } from "./art";

export const GiftRegistries = () => (
    <section className="bg-[#f5fbfd] px-4 py-12">
        <h2 className="text-3xl text-center">Gift Registries</h2>

        <p className="text-center text-slate-700 max-w-2xl mx-auto mt-3">
            Whether you&apos;re celebrating a wedding, a baby, a birthday, or any other memorable
            milestones, our Gift Registries will help you and your guests find the perfect gifts.
        </p>

        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
            {registries.map((registry) => (
                <Link
                    key={registry.title}
                    href={placeholder(registry.occasion)}
                    className="bg-white border border-slate-200 hover:shadow-md transition"
                >
                    <RegistryArt art={registry.art} />

                    <p className="text-center px-3 py-4">{registry.title}</p>
                </Link>
            ))}
        </div>
    </section>
);

export const OtherLists = () => (
    <section className="px-4 py-12">
        <h2 className="text-3xl text-center">Other lists</h2>

        <div className="max-w-xl mx-auto mt-8">
            <Link
                href={placeholder("Alexa Shopping List")}
                className="flex items-center gap-4 border border-slate-300 rounded-lg p-4 hover:shadow-md transition"
            >
                <AlexaTile />

                <span>
                    <span className="block font-bold">Alexa Shopping List</span>
                    <span className="block text-sm text-slate-700">
                        Create and manage your lists on your Alexa-enabled device
                    </span>
                </span>
            </Link>
        </div>
    </section>
);

export const GetHelp = () => (
    <section className="bg-[#f5fbfd] px-4 py-10 text-center">
        <h2 className="text-3xl">Get Help</h2>

        <p className="mt-4">
            Need more information?{" "}
            <Link href={placeholder("Help")} className="text-[#007185] hover:underline">
                Visit our Help section
            </Link>
        </p>

        <p className="mt-2">
            Want help with a list or registry?{" "}
            <Link href={placeholder("Customer Service")} className="text-[#007185] hover:underline">
                Contact customer service
            </Link>
        </p>
    </section>
);
