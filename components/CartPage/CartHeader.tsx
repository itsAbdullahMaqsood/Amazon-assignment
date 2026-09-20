"use client";

import { compareArrays } from "@/utils/array_utils";

const CartHeader = ({ cartItems, selected, setSelected }: any) => {
    const allSelected = compareArrays(cartItems, selected);

    const selectHandler = () => {
        if (selected.length !== cartItems.length) {
            setSelected(cartItems);
        } else {
            setSelected([]);
        }
    };

    return (
        <div className="bg-white rounded border border-gray-200 py-2 px-4 mb-4">
            <h1 className="font-bold text-3xl my-2">item Summary ({selected.length})</h1>

            <div className="h-px w-full bg-slate-200" />

            <div className="flex items-center gap-2 py-3">
                <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={selectHandler}
                    className="w-5 h-5 cursor-pointer"
                />
                <span>Select items</span>
            </div>
        </div>
    );
};

export default CartHeader;
