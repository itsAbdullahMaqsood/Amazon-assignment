import { redirect } from "next/navigation";

import { auth } from "@/auth";
import SignInPage from "@/components/User/SignInPage";

const Page = async ({ searchParams }: any) => {
    const query = await searchParams;
    const session = await auth();

    if (session) {
        redirect(query?.callbackUrl || "/");
    }

    // amazon.com/ap/signin has no site header or footer either.
    return (
        <SignInPage
            callbackUrl={query?.callbackUrl || ""}
            activated={query?.activated === "1"}
            tokenError={query?.error === "invalid_token"}
        />
    );
};

export default Page;
