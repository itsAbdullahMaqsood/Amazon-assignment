import { headers } from "next/headers";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcrypt";

import connectDb from "@/lib/db";
import User from "@/models/User";
import { emailQuery } from "@/lib/authRules";
import { currentSessionVersion } from "@/lib/sessionVersion";

// Auth.js v5 swallows plain Errors thrown from authorize() and reports a generic
// failure, so the message travels in `code`, which signIn() returns to the client.
class CredentialsError extends CredentialsSignin {
    code: string;

    constructor(message: string) {
        super(message);
        this.code = message;
    }
}

// The Vercel project carries a stale AUTH_URL/NEXTAUTH_URL of
// http://localhost:3000, and Auth.js builds every signin and callback URL from
// it, so Google came back to localhost. A localhost value is always wrong off
// the local machine: drop it there and let Auth.js read the request host.
if (process.env.VERCEL) {
    for (const key of ["AUTH_URL", "NEXTAUTH_URL"]) {
        if (/localhost|127\.0\.0\.1/.test(process.env[key] || "")) {
            delete process.env[key];
        }
    }
}

// One row per browser, keyed by its user-agent string: signing in again from
// the same browser moves `lastSeen` rather than adding another line. Nothing
// else about the request is stored.
const recordSignIn = async (userId: string) => {
    try {
        const userAgent = (await headers()).get("user-agent") || "Unknown browser";
        const now = new Date();
        const updated = await User.updateOne(
            { _id: userId, "signIns.userAgent": userAgent },
            { $set: { "signIns.$.lastSeen": now } }
        );

        if (!updated.matchedCount) {
            await User.updateOne(
                { _id: userId },
                { $push: { signIns: { $each: [{ userAgent, firstSeen: now, lastSeen: now }], $slice: -20 } } }
            );
        }
    } catch {
        // Headers are not always reachable from this context; a missing record
        // must never stop someone signing in.
    }
};

export const { handlers, auth, signIn, signOut } = NextAuth({
    trustHost: true,
    session: { strategy: "jwt" },
    pages: { signIn: "/auth/signin" },
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials: any) => {
                await connectDb();

                const user: any = await User.findOne(emailQuery(credentials?.email)).lean();

                // One message for both cases, so the form doesn't tell a stranger
                // which emails have accounts.
                const passwordMatches = user
                    ? await bcrypt.compare(String(credentials?.password || ""), user.password || "")
                    : false;

                if (!passwordMatches) {
                    throw new CredentialsError("That email and password don't match an account.");
                }

                return {
                    id: String(user._id),
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role,
                    sessionVersion: user.sessionVersion || 1,
                };
            },
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_SECRET,
        }),
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID || process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET || process.env.GITHUB_SECRET,
        }),
    ],
    callbacks: {
        // OAuth users get a Mongo document on first sign-in, so every signed-in
        // user has an _id the API routes can resolve.
        signIn: async ({ user, account }: any) => {
            if (account?.provider === "credentials") {
                return true;
            }

            await connectDb();

            const existing = await User.findOne(emailQuery(user.email));

            // No password is stored for a provider account: there is none to give
            // out, and "Login & security" can then say honestly how you sign in.
            // Setting one later goes through the ordinary reset-by-email flow.
            if (!existing) {
                await new User({
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    emailVerified: true,
                }).save();
            }

            return true;
        },
        jwt: async ({ token, user, account, trigger, session }: any) => {
            // The account page renames the user and calls update({ name }); without
            // this the header would keep greeting them by the old name until they
            // signed in again.
            if (trigger === "update" && session?.name) {
                token.name = session.name;
            }

            if (user) {
                if (account?.provider === "credentials") {
                    token.sub = user.id;
                    token.role = user.role;
                    token.sv = user.sessionVersion || 1;
                } else {
                    // The provider's own id must never survive here: every API route
                    // resolves the user by token.sub.
                    await connectDb();
                    const dbUser: any = await User.findOne(emailQuery(user.email)).lean();

                    if (dbUser) {
                        token.sub = String(dbUser._id);
                        token.role = dbUser.role;
                        token.sv = dbUser.sessionVersion || 1;
                    }
                }

                if (token.sub) {
                    await recordSignIn(token.sub);
                }

                return token;
            }

            // Every later call checks the token against the account's session
            // version. "Sign out everywhere" bumps that number, which is what
            // makes tokens issued before it stop working. The lookup is cached
            // for a few seconds per process, so the several auth() calls inside
            // one request cost one read rather than several.
            if (token.sub) {
                const version = await currentSessionVersion(token.sub);

                if (version === null || version !== (token.sv || 1)) {
                    return null;
                }
            }

            return token;
        },
        session: async ({ session, token }: any) => {
            if (session.user) {
                session.user.id = token.sub;
                session.user.role = token.role;
            }

            return session;
        },
    },
});
