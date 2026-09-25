import { redirect } from "next/navigation";

import { auth } from "@/auth";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = { title: "Create an account" };

const safeCallback = (value: any) => (typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "");

const Page = async ({ searchParams }: any) => {
    const query = await searchParams;
    const callbackUrl = safeCallback(query?.callbackUrl);
    const session = await auth();

    if (session) {
        redirect(callbackUrl || "/");
    }

    // /business and /sell hand over the address the visitor already typed.
    return (
        <RegisterForm
            email={query?.email || ""}
            callbackUrl={callbackUrl}
            context={query?.business === "1" ? "business" : query?.seller === "1" ? "seller" : ""}
        />
    );
};

export default Page;
