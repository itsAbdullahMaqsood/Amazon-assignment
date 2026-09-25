import { redirect } from "next/navigation";

import { auth } from "@/auth";
import SignInForm from "@/components/auth/SignInForm";

export const metadata = { title: "Sign in" };

// Only same-site paths are followed after signing in.
const safeCallback = (value: any) => (typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "");

const Page = async ({ searchParams }: any) => {
    const query = await searchParams;
    const callbackUrl = safeCallback(query?.callbackUrl);
    const session = await auth();

    if (session) {
        redirect(callbackUrl || "/");
    }

    return <SignInForm callbackUrl={callbackUrl} activated={query?.activated === "1"} tokenError={query?.error === "invalid_token"} />;
};

export default Page;
