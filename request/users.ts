import axios from "axios";

export const updateCart = async (products: any[]) => {
    const { data } = await axios.post("/api/user/updatecart", { products });
    return data;
};

export const saveCart = async (cart: any[]) => {
    const { data } = await axios.post("/api/user/savecart", { cart });
    return data;
};
