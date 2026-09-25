import { redirect } from "next/navigation";

import { activateUser } from "@/utils/activateUser";

// The activation email links here; verification happens before anything renders.
const Page = async ({ params }: any) => {
    const { token } = await params;
    const activated = await activateUser(token);

    redirect(activated ? "/auth/signin?activated=1" : "/auth/signin?error=invalid_token");
};

export default Page;
