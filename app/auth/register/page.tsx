import { redirect } from "next/navigation";

import { auth } from "@/auth";
import RegisterPage from "@/components/User/RegisterPage";

export const metadata = { title: "Amazon Sign Up" };

const Page = async ({ searchParams }: any) => {
    const query = await searchParams;
    const session = await auth();

    if (session) {
        redirect(query?.callbackUrl || "/");
    }

    // amazon.com/ap/register carries no site header or footer, so the page is
    // the form alone.
    // /business and /sell hand the address the visitor already typed over.
    return (
        <RegisterPage
            business={query?.business === "1"}
            seller={query?.seller === "1"}
            email={query?.email || ""}
        />
    );
};

export default Page;
