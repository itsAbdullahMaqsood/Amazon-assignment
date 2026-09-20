"use client";

import { useState } from "react";
import axios from "axios";

import { useAppDispatch } from "@/redux/hooks";
import { emptyCart } from "@/redux/slices/CartSlice";
import { showDialog } from "@/redux/slices/DialogSlice";
import DotLoaderSpinner from "@/components/loaders/dotLoader/DotLoaderSpinner";
import OrderInfo from "./OrderInfo";
import Product from "./Product";
import Total from "./Total";
import UserInfo from "./UserInfo";
import Payment from "./Payment";

const OrderClient = ({ order: initialOrder }: any) => {
    const dispatch = useAppDispatch();
    const [order, setOrder] = useState<any>(initialOrder);
    const [loading, setLoading] = useState<boolean>(false);

    const payHandler = async () => {
        try {
            setLoading(true);

            const { data } = await axios.put("/api/order/payment", { id: order._id });

            setOrder(data);
            // The cart became an order, so the persisted Redux copy goes too.
            dispatch(emptyCart());
        } catch (error: any) {
            dispatch(
                showDialog({
                    header: "Payment Error",
                    msgs: [
                        {
                            msg: error.response?.data?.message || error.message,
                            type: "error",
                        },
                    ],
                })
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading && <DotLoaderSpinner loading={loading} />}

            <section className="col-span-2 bg-white p-2 md:p-5 rounded-xl border border-slate-200">
                <OrderInfo order={order} />

                {order.products.map((product: any, i: number) => (
                    <Product key={i} product={product} />
                ))}

                <Total order={order} />
            </section>

            <section className="md:col-span-1 h-fit bg-white p-2 md:p-5 rounded-xl border border-slate-200">
                <UserInfo user={order.user} address={order.shippingAddress} />

                {!order.isPaid && <Payment order={order} onPay={payHandler} />}
            </section>
        </>
    );
};

export default OrderClient;
