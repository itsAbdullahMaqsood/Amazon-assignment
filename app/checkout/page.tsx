import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import Header from "@/components/Header/Header";
import MenuSideBar from "@/components/Header/MenuSidebar";
import CheckoutClient from "@/components/checkoutPage/CheckoutClient";

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/checkout");
    }

    await connectDb();

    const user: any = await User.findById(session.user.id).lean();
    // Cart lines store no slug, so the product reference is populated to build
    // the links on the checkout tiles.
    const cart: any = await Cart.findOne({ user: user?._id })
        .populate({ path: "products.product", model: Product, select: "slug" })
        .lean();

    if (!cart) {
        redirect("/cart");
    }

    return (
        <>
            <Header title="Checkout" />

            <main className="grid grid-cols-1 md:grid-cols-3 px-2 md:px-10 mb-10 py-4 gap-4 md:gap-8">
                <CheckoutClient
                    user={JSON.parse(JSON.stringify(user))}
                    cart={JSON.parse(JSON.stringify(cart))}
                />
            </main>

            <MenuSideBar />
        </>
    );
};

export default Page;
