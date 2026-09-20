import Image from "next/image";
import { GlobeAltIcon } from "@heroicons/react/24/outline";

import amazonLogo from "@/public/assets/images/amazon-logo.png";
import enFlag from "@/public/assets/images/en-flag.png";

const linkColumns = [
    {
        title: "Get to Know Us",
        links: ["Blog", "About Amazon", "Investor Relations", "Amazon Devices", "Amazon Science"],
    },
    {
        title: "Make Money with Us",
        links: [
            "Sell products on Amazon",
            "Sell on Amazon Business",
            "Sell apps on Amazon",
            "Become an Affiliate",
            "Advertise Your Products",
            "Self-Publish with Us",
            "Host an Amazon Hub",
            "See More Make Money with Us",
        ],
    },
    {
        title: "Amazon Payment Products",
        links: [
            "Amazon Business Card",
            "Shop with Points",
            "Investor Relations",
            "Reload Your Balance",
            "Amazon Currency Converter",
        ],
    },
    {
        title: "Let Us Help You",
        links: [
            "Amazon and COVID-19",
            "Your Account",
            "Your Orders",
            "Shipping Rates & Policies",
            "Returns & Replacements",
            "Manage Your Content and Devices",
            "Amazon Assistant",
            "Help",
        ],
    },
];

const services = [
    { title: "Amazon Music", desc: "Stream millions of songs" },
    { title: "Amazon Global", desc: "Ship Orders Internationally" },
    { title: "Home Services", desc: "Experienced Pros Happiness Guarantee" },
    { title: "PillPack", desc: "Pharmacy Simplified" },
    { title: "Amazon Advertising", desc: "Find, attract and engage customers" },
    { title: "6pm", desc: "Score deals on fashion brands" },
    { title: "AbeBooks", desc: "Books, art & collectibles" },
    { title: "ACX", desc: "Audiobook Publishing Made Easy" },
    { title: "Sell on Amazon", desc: "Start a Selling Account" },
    { title: "Amazon Business", desc: "Everything For Your Business" },
    { title: "AmazonGlobal", desc: "Ship Orders Internationally" },
    { title: "Amazon Web Services", desc: "Scalable Cloud Computing Services" },
    { title: "Audible", desc: "Listen to Books & Original Audio" },
    { title: "Box Office Mojo", desc: "Find Movie Box Office Data" },
];

const Footer = () => {
    const backToTopHandler = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="w-full flex flex-col">
            <div
                onClick={backToTopHandler}
                className="bg-[#37475a] hover:bg-[#485769] text-white text-xs text-center py-4 cursor-pointer"
            >
                Back to top
            </div>

            <div className="bg-amazon-blue_light grid grid-cols-2 lg:grid-cols-4 gap-8 px-8 md:px-32 py-10 border-b border-slate-600">
                {linkColumns.map((column) => (
                    <div key={column.title} className="link-footer">
                        <h5>{column.title}</h5>
                        <ul>
                            {column.links.map((link) => (
                                <li key={link}>{link}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="bg-amazon-blue_light flex flex-wrap items-center justify-center gap-4 py-8">
                <Image
                    src={amazonLogo}
                    alt="amazon logo"
                    width={100}
                    height={30}
                    className="object-contain w-20"
                />

                <div className="flex items-center border border-slate-500 rounded-sm text-white text-xs px-3 py-1.5 link">
                    <GlobeAltIcon className="h-4 mr-1" />
                    English
                </div>

                <div className="flex items-center border border-slate-500 rounded-sm text-white text-xs px-3 py-1.5 link">
                    $ USD - U.S. Dollar
                </div>

                <div className="flex items-center border border-slate-500 rounded-sm text-white text-xs px-3 py-1.5 link">
                    <Image
                        src={enFlag}
                        alt="en flag"
                        width={20}
                        height={20}
                        className="object-contain mr-1"
                    />
                    United States
                </div>
            </div>

            <div className="bg-[#131A22] py-10 px-8 md:px-32">
                <ul className="footer-link-services grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-y-5 justify-items-center">
                    {services.map((service) => (
                        <li key={service.title}>
                            <span className="font-semibold text-white block">{service.title}</span>
                            <p>{service.desc}</p>
                        </li>
                    ))}
                </ul>

                <div className="flex flex-col items-center mt-10 space-y-2">
                    <ul className="flex items-center space-x-4 text-slate-300 text-xs">
                        <li className="link">Conditions of Use</li>
                        <li className="link">Privacy Notice</li>
                        <li className="link">Your Ads Privacy Choices</li>
                    </ul>
                    <p className="text-slate-300 text-xs">
                        &copy; 1996-2023, Amazon.com, Inc. or its affiliates
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
