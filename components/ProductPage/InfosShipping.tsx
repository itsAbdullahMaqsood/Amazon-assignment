"use client";

import { useState } from "react";
import { ChevronDownIcon, LockClosedIcon, MapPinIcon } from "@heroicons/react/24/outline";

const InfosShipping = ({ product }: any) => {
    const [showDetails, setShowDetails] = useState<boolean>(false);

    return (
        <div className="max-h-96 rounded-lg border border-gray-300 p-3 flex flex-col row-span-2 md:col-span-2">
            <span className="font-semibold text-xl">{product.price}$</span>

            <span className="text-sm mt-2">No Import Fees Deposit</span>

            <div className="flex items-center text-blue-500 text-sm mt-1">
                <span>
                    {product.shipping ? `+${product.shipping}$ Shipping Fee` : "Free Shipping"}
                </span>
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center ml-2 cursor-pointer"
                >
                    Details
                    <ChevronDownIcon
                        className={`h-4 transition-transform ${showDetails ? "rotate-180" : ""}`}
                    />
                </button>
            </div>

            {showDetails && (
                <span className="text-xs text-slate-500 mt-1">
                    Shipping fees are calculated for a standard delivery to Germany.
                </span>
            )}

            <p className="text-sm mt-3">
                Delivery <b>Thursday, March 23</b>. Order within{" "}
                <span className="text-green-700">23 hrs 53 mins</span>
            </p>

            <div className="flex items-center text-blue-500 text-sm mt-2">
                <MapPinIcon className="h-4 mr-1" />
                <span>Deliver to Germany</span>
            </div>

            <span
                className={`font-semibold mt-2 ${
                    product.quantity > 1 ? "text-green-700" : "text-red-500"
                }`}
            >
                {product.quantity > 1 ? "In Stock" : "Sold"}
            </span>

            <div className="flex items-center text-blue-600 text-sm mt-2">
                <LockClosedIcon className="h-4 mr-1" />
                <span>Secure transaction</span>
            </div>

            <div className="text-xs mt-3 space-y-1">
                <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500">Ships from</span>
                    <span className="col-span-2">Amazon</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500">Sold by</span>
                    <span className="col-span-2">ATUAT</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500">Returns</span>
                    <span className="col-span-2">
                        Eligible for Return, Refund or Replacement within 30 days of receipt
                    </span>
                </div>
            </div>
        </div>
    );
};

export default InfosShipping;
