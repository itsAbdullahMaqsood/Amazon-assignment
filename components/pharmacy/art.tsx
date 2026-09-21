// Amazon's photography and partner marks are not reproduced here. These are
// composed stand-ins built from shapes and heroicons, in the same palette.
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export const PillPackArt = () => (
    <div className="relative w-full h-[360px]">
        <div className="absolute right-10 top-6 w-64 h-64 rounded-full bg-[#00a19a]" />

        <div className="absolute left-2 top-16 w-64 rotate-[-8deg] bg-white rounded-lg shadow-xl p-4">
            <p className="text-2xl font-bold">6:00 PM</p>
            <p className="text-lg">Friday</p>
            <ul className="mt-3 text-[11px] uppercase tracking-wide space-y-1 text-slate-700">
                <li>1 Metformin 1000 mg</li>
                <li>1 Atorvastatin 20 mg</li>
                <li>1 Metoprolol ER 50 mg</li>
            </ul>
            <p className="mt-4 text-xs text-slate-500">amazon pharmacy</p>
        </div>

        <div className="absolute right-16 top-20 w-40 rotate-[8deg]">
            <div className="h-6 rounded-t-xl bg-[#00a19a]" />
            <div className="bg-[#c8622a] rounded-b-lg p-3 pt-4">
                <div className="bg-white rounded p-2">
                    <p className="text-[10px] text-slate-500">amazon pharmacy</p>
                    <p className="text-sm font-bold leading-tight">Bupropion XL 150 mg</p>
                    <p className="text-[10px] mt-1">Take one tablet by mouth daily in the morning</p>
                </div>
            </div>
        </div>
    </div>
);

export const PrimeSavingsArt = () => (
    <div className="bg-[#dff1f7] h-[260px] flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow p-4 w-64">
            <p className="font-bold">Price with Prime</p>
            <p className="mt-1">
                <span className="text-[#CC0C39] text-xl font-bold mr-2">-80%</span>
                <span className="text-xl font-bold">$10</span>
                <span className="text-sm align-top">00</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">$40.00 Prime savings</p>
        </div>
    </div>
);

export const RxPassArt = () => (
    <div className="bg-[#dff1f7] h-[260px] flex items-center justify-center p-6">
        <div className="w-32 h-32 rounded-full bg-[#1b45d6] text-white flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold leading-none">$5</span>
            <span className="text-sm">/month</span>
        </div>
    </div>
);

export const CouponArt = () => (
    <div className="bg-[#dff1f7] h-[260px] flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow p-4 w-64">
            <p className="text-[11px] border border-slate-300 rounded px-2 py-0.5 w-fit">
                Prescription required
            </p>
            <p className="font-bold mt-2">Price with coupon</p>
            <p className="mt-1">
                <span className="line-through text-slate-500 mr-2">$250</span>
                <span className="text-xl font-bold">$50</span>
                <span className="text-sm align-top">00</span>
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span className="bg-[#b35400] text-white text-[10px] px-1 rounded">Coupon</span>
                <CheckCircleIcon className="w-4 h-4 text-[#007a72]" />
                $200.00 coupon savings
            </p>
        </div>
    </div>
);

export const InsuranceCardArt = () => (
    <div className="bg-[#00c1a6] rounded-2xl p-10 flex items-center justify-center">
        <div className="w-full max-w-sm rounded-xl overflow-hidden shadow-xl rotate-[-6deg]">
            <div className="bg-[#0f766e] text-white px-4 py-3 text-sm font-semibold">
                Health Insurance Card
            </div>
            <div className="bg-slate-100 px-4 py-4 grid grid-cols-2 gap-3 text-[11px] font-mono">
                <div>
                    <p className="text-slate-500">MEMBER NAME</p>
                    <p>MORGAN SMITH</p>
                </div>
                <div>
                    <p className="text-slate-500">MEMBER NUMBER</p>
                    <p>123456XYZ</p>
                </div>
                <div>
                    <p className="text-slate-500">RxBIN</p>
                    <p>012345</p>
                </div>
                <div>
                    <p className="text-slate-500">RxGRP</p>
                    <p>1234</p>
                </div>
                <div>
                    <p className="text-slate-500">GROUP NUMBER</p>
                    <p>AMAZONRX1</p>
                </div>
                <div>
                    <p className="text-slate-500">DATE OF BIRTH</p>
                    <p>07/05/94</p>
                </div>
            </div>
        </div>
    </div>
);

export const DeliveryArt = () => (
    <div className="relative h-[280px] flex items-center justify-center">
        <div className="w-64 h-40 bg-[#c8a06a] rounded-md shadow-lg" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-6 bg-white rounded-lg shadow px-4 py-3 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-[#00a19a]" />
            <span>
                <span className="font-bold block leading-tight">Delivered</span>
                <span className="text-xs text-slate-500">Today at 8:59 AM, Springdale, AR</span>
            </span>
        </div>
    </div>
);
