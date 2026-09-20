"use client";

import { useState } from "react";

import ListShipping from "./ListShipping";
import AddShipping from "./AddShipping";

const ShippingPage = ({ user, addresses, setAddresses, profile }: any) => {
    const [visible, setVisible] = useState<boolean>(addresses.length === 0);

    return (
        <div>
            {!profile && (
                <h2 className="text-xl font-semibold pb-2 mb-4 border-b-2 border-slate-200">
                    Shipping Information
                </h2>
            )}

            <ListShipping
                visible={visible}
                setVisible={setVisible}
                addresses={addresses}
                setAddresses={setAddresses}
                user={user}
                profile={profile}
            />

            {visible && (
                <div className="mt-4">
                    <AddShipping setAddresses={setAddresses} setVisible={setVisible} />
                </div>
            )}
        </div>
    );
};

export default ShippingPage;
