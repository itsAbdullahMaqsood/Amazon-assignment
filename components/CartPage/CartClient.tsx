"use client";

import { useAppSelector } from "@/redux/hooks";
import CartPage from "./CartPage";
import Empty from "./Empty";

// Cart state lives in redux-persist (client only) while the auth guard runs on the
// server, so the page splits here.
const CartClient = () => {
    const cartItems = useAppSelector((state) => state.cart.cartItems);

    return cartItems.length > 0 ? <CartPage cartItems={cartItems} /> : <Empty />;
};

export default CartClient;
