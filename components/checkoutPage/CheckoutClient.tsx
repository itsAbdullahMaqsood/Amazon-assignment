"use client";

import { useState } from "react";

import DotLoaderSpinner from "@/components/loaders/dotLoader/DotLoaderSpinner";
import ShippingPage from "./ShippingPage";
import Product from "./product/Product";
import Payment from "./payment/Payment";
import Summary from "./Summary/Summary";

const CheckoutClient = ({ user, cart }: any) => {
    const [addresses, setAddresses] = useState<any[]>(user.address || []);
    // Preselects whatever the user saved under Your Payments.
    const [paymentMethod, setPaymentMethod] = useState<string>(
        user.defaultPaymentMethod || "paypal"
    );
    const [totalAfterDiscount, setTotalAfterDiscount] = useState<any>("");
    const [loading, setLoading] = useState<boolean>(false);

    // Derived from the address list, never mirrored into its own state.
    const selectedAddress = addresses.find((address: any) => address.active);

    return (
        <>
            {loading && <DotLoaderSpinner loading={loading} />}

            <section className="col-span-2">
                <ShippingPage user={user} addresses={addresses} setAddresses={setAddresses} />
                <Product cart={cart} />
            </section>

            <section className="col-span-1">
                <Payment paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
                <Summary
                    cart={cart}
                    paymentMethod={paymentMethod}
                    selectedAddress={selectedAddress}
                    totalAfterDiscount={totalAfterDiscount}
                    setTotalAfterDiscount={setTotalAfterDiscount}
                    setLoading={setLoading}
                />
            </section>
        </>
    );
};

export default CheckoutClient;
