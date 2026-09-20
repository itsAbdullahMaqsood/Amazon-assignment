import jwt from "jsonwebtoken";

import connectDb from "@/lib/db";
import User from "@/models/User";

// Shared by the activation page (the URL the email points at) and the route
// handler, so there is one implementation of "is this token good?".
export const activateUser = async (token: string) => {
    try {
        const payload: any = jwt.verify(token, process.env.ACTIVATION_TOKEN_SECRET as string);

        await connectDb();

        const user = await User.findById(payload.id);

        if (!user) {
            return false;
        }

        user.emailVerified = true;
        await user.save();

        return true;
    } catch {
        return false;
    }
};
