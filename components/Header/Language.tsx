import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

import enFlag from "@/public/assets/images/en-flag.png";

const languages = [
    { label: "English - EN", value: "en" },
    { label: "español - ES", value: "es" },
    { label: "العربية - AR", value: "ar" },
    { label: "Deutsch - DE", value: "de" },
];

const Language = () => {
    return (
        <div className="hidden md:flex show-account relative items-center link">
            <div className="flex items-end">
                <Image src={enFlag} alt="en flag" width={24} height={24} className="object-contain" />
                <span className="font-bold text-sm ml-1">EN</span>
                <ChevronDownIcon className="h-4 text-slate-300 stroke-[3]" />
            </div>

            <div className="show-account-popup absolute top-full left-1/2 -translate-x-1/2 pt-4 z-50">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 h-3 w-3 bg-white rotate-45" />
                <div className="w-56 bg-white text-black rounded shadow-lg p-4">
                    <p className="text-xs mb-3">
                        Change Language <span className="text-blue-600 link">Learn more</span>
                    </p>
                    <div className="space-y-2">
                        {languages.map((language, i) => (
                            <label key={language.value} className="flex items-center text-sm link">
                                <input
                                    type="radio"
                                    name="language"
                                    value={language.value}
                                    defaultChecked={i === 0}
                                    className="mr-2 accent-amazon-orange"
                                />
                                {language.label}
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Language;
