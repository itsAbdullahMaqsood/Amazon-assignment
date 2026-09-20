"use client";

import { useState } from "react";

// The checkout components are reused as-is with the `profile` flag; saving,
// selecting the active address and deleting behave exactly as at checkout.
import ShippingPage from "@/components/checkoutPage/ShippingPage";

const AddressClient = ({ user }: any) => {
    const [addresses, setAddresses] = useState<any[]>(user.address || []);

    return (
        <ShippingPage
            user={user}
            addresses={addresses}
            setAddresses={setAddresses}
            profile
        />
    );
};

export default AddressClient;
