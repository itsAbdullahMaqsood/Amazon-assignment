import { NextResponse } from "next/server";

import { activateUser } from "@/utils/activateUser";

export const GET = async (req: Request, { params }: any) => {
    const { token } = await params;
    const origin = new URL(req.url).origin;
    const activated = await activateUser(token);

    return NextResponse.redirect(
        new URL(activated ? "/auth/signin?activated=1" : "/auth/signin?error=invalid_token", origin)
    );
};
