import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface CartState {
    cartItems: any[];
}

const initialState: CartState = {
    cartItems: [],
};

export const CartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<any>) => {
            state.cartItems.push(action.payload);
        },
        updateCart: (state, action: PayloadAction<any[]>) => {
            state.cartItems = action.payload;
        },
        emptyCart: (state) => {
            state.cartItems = [];
        },
    },
});

export const { addToCart, updateCart, emptyCart } = CartSlice.actions;

export const selectCart = (state: RootState) => state.cart;

export default CartSlice.reducer;
