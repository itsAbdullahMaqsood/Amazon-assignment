"use client";

import Image from "next/image";
import axios from "axios";
import {
    CheckIcon,
    ChevronUpIcon,
    MapPinIcon,
    MinusCircleIcon,
    PhoneIcon,
    PlusSmallIcon,
    UserIcon,
} from "@heroicons/react/24/outline";

const ListShipping = ({ visible, setVisible, addresses, setAddresses, user, profile }: any) => {
    const selectHandler = async (id: string) => {
        const { data } = await axios.put("/api/user/manageaddress", { id });
        setAddresses(data.addresses);
    };

    const deleteHandler = async (e: any, id: string) => {
        e.stopPropagation();
        const { data } = await axios.delete("/api/user/manageaddress", { data: { id } });
        setAddresses(data.addresses);
    };

    return (
        <div>
            {addresses.map((address: any) => (
                <div
                    key={address._id}
                    onClick={() => selectHandler(address._id)}
                    className={`relative cursor-pointer p-4 mb-4 border border-slate-100 rounded-xl shadow-md hover:shadow-xl hover:border-white hover:scale-[101%] transition duration-300 ${
                        address.active ? "border-l-4 border-l-ink-800" : ""
                    }`}
                >
                    {addresses.length > 1 && (
                        <button
                            onClick={(e) => deleteHandler(e, address._id)}
                            className="absolute top-2 right-2 hover:text-red-500 cursor-pointer"
                            aria-label="Remove address"
                        >
                            <MinusCircleIcon className="w-6 h-6" />
                        </button>
                    )}

                    <div className="grid grid-cols-[auto_1fr] gap-3 items-center">
                        <Image
                            src={user?.image || "/assets/images/user-image-default.jpg"}
                            alt=""
                            width={60}
                            height={60}
                            className="rounded-full object-cover"
                        />

                        <div>
                            <p className="flex items-center gap-1 font-semibold">
                                <UserIcon className="w-4 h-4" />
                                {`${address.firstName} ${address.lastName}`.toUpperCase()}
                            </p>
                            <p className="flex items-center gap-1 text-sm">
                                <PhoneIcon className="w-4 h-4" />
                                {address.phoneNumber}
                            </p>
                        </div>
                    </div>

                    <div className="mt-2 text-sm space-y-1">
                        <p className="flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4" />
                            {address.address1}
                        </p>

                        {address.address2 && (
                            <p className="flex items-center gap-1">
                                <MapPinIcon className="w-4 h-4" />
                                {address.address2}
                            </p>
                        )}

                        <p>{`${address.city},${address.state},${address.country}`}</p>

                        <div className="flex items-center gap-3">
                            <span>{address.zipCode}</span>

                            {address.active && (
                                <span className="flex items-center gap-1 text-ink-800 font-semibold">
                                    <CheckIcon className="w-4 h-4" />
                                    Active
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            <div className="flex justify-center">
                <button
                    onClick={() => setVisible(!visible)}
                    className="w-52 py-4 rounded-xl flex items-center justify-center bg-ink-800 text-slate-100 hover:bg-accent-strong hover:text-ink-900 transition duration-300 hover:scale-95 cursor-pointer"
                >
                    {visible ? (
                        <ChevronUpIcon className="w-6 h-6" />
                    ) : (
                        <>
                            <PlusSmallIcon className="w-6 h-6 mr-1" />
                            Add New Address
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ListShipping;
