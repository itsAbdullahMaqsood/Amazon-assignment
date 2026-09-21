import Link from "next/link";
import Image from "next/image";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

// amazon.com/ap/* pages drop the site header entirely: just the wordmark, one
// narrow card and a thin footer.
export const ApPage = ({ children }: any) => (
    <div className="min-h-screen bg-white flex flex-col items-center">
        <Link href="/" className="mt-4 mb-2">
            <Image
                src="/assets/images/amazon-dark.png"
                alt="amazon"
                width={200}
                height={60}
                className="w-[103px] object-contain"
            />
        </Link>

        <div className="w-full max-w-[350px] px-4 sm:px-0">{children}</div>

        <div className="w-full mt-12 border-t border-slate-200 bg-linear-to-b from-slate-50 to-white">
            <div className="flex flex-col items-center gap-2 py-6 text-[11px]">
                <div className="flex gap-5 text-[#0066c0]">
                    <Link href="/customer-service/security-privacy" className="hover:underline hover:text-[#c45500]">
                        Conditions of Use
                    </Link>
                    <Link href="/profile/data" className="hover:underline hover:text-[#c45500]">
                        Privacy Notice
                    </Link>
                    <Link href="/customer-service" className="hover:underline hover:text-[#c45500]">
                        Help
                    </Link>
                </div>
                <p className="text-[#555]">© 1996-{new Date().getFullYear()}, Amazon clone, built for coursework</p>
            </div>
        </div>
    </div>
);

export const ApCard = ({ children }: any) => (
    <div className="border border-[#ddd] rounded-lg p-5">{children}</div>
);

export const ApAlert = ({ title = "There was a problem", children }: any) => (
    <div className="border border-[#c40000] bg-[#fff7f7] rounded p-3 flex gap-2 mb-3">
        <ExclamationTriangleIcon className="h-5 w-5 text-[#c40000] shrink-0" />
        <div>
            <p className="text-[13px] font-bold text-[#0F1111]">{title}</p>
            <p className="text-[12px] text-[#0F1111] mt-0.5">{children}</p>
        </div>
    </div>
);

export const ApButton = ({ children, ...rest }: any) => (
    <button
        {...rest}
        className="w-full h-[31px] mt-5 rounded-lg text-[13px] text-[#0F1111] bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] shadow-[0_2px_5px_0_rgba(213,217,217,.5)] disabled:opacity-60 cursor-pointer"
    >
        {children}
    </button>
);
