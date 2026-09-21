import connectDb from "@/lib/db";
import User from "@/models/User";
import { escapeRegex } from "@/utils/regex";

// Server-only. Fields are listed explicitly: password hashes, addresses and
// gift card ledgers never leave the server.
export const USER_FIELDS = "name email role image emailVerified createdAt";

export const ROLES = ["user", "admin"];

export const PAGE_SIZE = 25;

export const listUsers = async ({ q = "", role = "", page = 1 }: any) => {
    await connectDb();

    const query: any = {};
    const term = String(q).trim().slice(0, 100);

    if (term) {
        const pattern = new RegExp(escapeRegex(term), "i");
        query.$or = [{ name: pattern }, { email: pattern }];
    }

    if (ROLES.includes(role)) {
        query.role = role;
    }

    const total = await User.countDocuments(query);
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const current = Math.min(Math.max(1, Number(page) || 1), pages);

    const users = await User.find(query)
        .select(USER_FIELDS)
        .sort({ createdAt: -1 })
        .skip((current - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .lean();

    return { users: JSON.parse(JSON.stringify(users)), total, page: current, pages };
};
