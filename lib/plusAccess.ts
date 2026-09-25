import User from "@/models/User";
import { isMember } from "@/lib/membership";

// Delivery is free for a Plus member, and for anyone a member has put in their
// household with sharing on. Both are read from the database at quote time; the
// browser never says which of the two applies.
export const hasPlusDelivery = async (user: any) => {
    if (isMember(user?.membership)) {
        return { plus: true, through: "" };
    }

    const email = String(user?.email || "").toLowerCase();

    if (!email) {
        return { plus: false, through: "" };
    }

    const sharer: any = await User.findOne({
        "household.members.email": email,
        "household.sharing.delivery": { $ne: false },
        "membership.status": { $in: ["trial", "active"] },
    })
        .select("name membership")
        .lean();

    if (sharer && isMember(sharer.membership)) {
        return { plus: true, through: sharer.name || "someone in your household" };
    }

    return { plus: false, through: "" };
};
